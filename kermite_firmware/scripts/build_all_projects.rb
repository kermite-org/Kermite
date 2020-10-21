#assuming executed in parent directory
#ruby scripts/build_all_projects.rb

require 'open3'
require 'fileutils'
require 'digest/md5'
require 'json'
require 'net/https'
require 'uri'
require 'rbconfig'

#build all firmware projects

ResourceStoreRepositoryBaseUrl = "https://yahiro07.github.io/KermiteResourceStore"

RegardSizeExcessAsError = true

def deleteFileIfExist(fpath)
  File.delete(fpath) if File.exist?(fpath)
end

def checkFirmwareSizeValid(logText)
  mProg = logText.match(/^Program.*\(([\d\.]+)\% Full\)/)
  mData = logText.match(/^Data.*\(([\d\.]+)\% Full\)/)
  if mProg && mData
    usegeProg = mProg[1].to_f
    usegeData = mData[1].to_f
    return usegeProg < 100.0 && usegeData < 100.0
  end
  false
end

def cleanPreviousFiles()
  distDir = "./dist"
  FileUtils.rm_rf(distDir) if File.exist?(distDir)
end

def buildProject(projectName)

  puts "building #{projectName} ..."

  coreName = File.basename(projectName)
  srcDir = "./src/projects/#{projectName}"
  midDir = "./build/#{projectName}"
  destDir = "./dist/variants/#{projectName}"
  FileUtils.mkdir_p(destDir)

  `make purge`
  #`touch #{srcDir}/rules.mk`
  command = "make #{projectName}:build"
  stdout, stderr, status = Open3.capture3(command);
  #puts stdout
  puts(stderr) if stderr

  buildSuccess = status == 0

  if buildSuccess && RegardSizeExcessAsError
    sizeCommand = "make #{projectName}:size"
    sizeOutputLines = `#{sizeCommand}`
    sizeValid = checkFirmwareSizeValid(sizeOutputLines)
    if !sizeValid
      buildSuccess = false
      command = sizeCommand
      stdout = ""
      stdout += "#{sizeOutputLines.strip()}\n\n"
      stdout += "firmware footprint overrun\n"
    end
  end

  if buildSuccess
    FileUtils.copy("#{midDir}/#{coreName}.hex", "#{destDir}/#{coreName}.hex")
  else
    File.write("#{destDir}/build_error.log",">#{command}\r\n#{stdout}#{stderr}")
  end

  FileUtils.copy("#{srcDir}/layout.json", "#{destDir}/layout.json")
  if File.exists?("#{srcDir}/profiles")
    FileUtils.copy_entry("#{srcDir}/profiles", "#{destDir}/profiles")
  end

  print "\e[A\e[K"
  puts "build #{projectName} ... #{buildSuccess ? 'ok': 'ng'}"

  buildSuccess
end

def buildProjects()
  projectNames = Dir.glob("./src/projects/**/rules.mk")
    .map{|path| File.dirname(path)}
    .select{|path| File.exists?(File.join(path, 'layout.json'))}
    .map{|path| path.sub('./src/projects/', '') }

  numTotal = 0
  numSuccess = 0
  projectNames.each{|projectName| 
    success = buildProject(projectName)
    numSuccess += 1 if success
    numTotal += 1
  }
  puts "buildStats #{numSuccess}/#{numTotal}"
  {total: numTotal, success: numSuccess}
end


def getOsVersion()
  isMacOs = RUBY_PLATFORM.include?("darwin")
  isLinux = RUBY_PLATFORM.include?("linux")
  isWindows = RUBY_PLATFORM.include?("windows")
  if isMacOs
    return "#{`sw_vers -productName`.strip} #{`sw_vers -productVersion`.strip}"
  elsif isLinux
    return `lsb_release -d`.sub("Description:", "").strip
  elsif isWindows
    return `ver`
  end
  ''
end


def getEnvVersions()
  osVersion = getOsVersion()
  avrGccVersion = `avr-gcc -v 2>&1 >/dev/null | grep "gcc version"`.strip
  makeVersion = `make -v | grep "GNU Make"`.strip
  {
    OS: osVersion,
    'avr-gcc': avrGccVersion,
    make: makeVersion 
  }
end

def makeCurrentSummary(stats)
  filePaths = Dir.glob("./dist/variants/**/*").select{|f| File.file?(f)}
  filesMd5Dict = filePaths.map{|filePath|
    relPath = filePath.sub("./dist/", "")
    md5 = Digest::MD5.file(filePath).to_s
    [relPath.intern, md5]
  }.to_h

  {
    info: {
      buildStats: stats,
      environment: getEnvVersions(),
      updatedAt: Time.now.to_s,
      filesRevision: 0
    },
    files: filesMd5Dict
  }
end

def fetchJson(url)
  uri = URI.parse(url)
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = url.start_with?('https') ? true : false
  req = Net::HTTP::Get.new(uri.request_uri)
  res = http.request(req)
  res.code == '200' ? JSON.parse(res.body, {:symbolize_names => true}) : nil
end

def mergeSummary(current, source)
  {
    info: {
      buildStats: current[:info][:buildStats],
      environment: current[:info][:environment],
      updatedAt: current[:info][:updatedAt],
      filesRevision: source[:info][:filesRevision] + 1
    },
    files: current[:files]
  }
end

# def loadLocalSummary()
#   localSummaryFilePath = "./dist/summary.json"
#   if(File.exists?(localSummaryFilePath))
#     text = File.read(localSummaryFilePath)
#     return JSON.parse(text, {:symbolize_names => true})
#   end
#   nil
# end

FallbackInitialSummary = {
  info: {
    buildStats: {
      success: 0,
      total: 0
    },
    environment: "",
    updatedAt: Time.now.to_s,
    filesRevision: 0
  },
  files: {}
}

def loadSourceSummary()
  remoteSummaryUrl = "#{ResourceStoreRepositoryBaseUrl}/resources/summary.json"
  remoteSummary = fetchJson(remoteSummaryUrl)
  if remoteSummary == nil
    STDERR.puts 'failed to fetch remote summary' 
    exit(1)
  end
  remoteSummary
  # localSummary = loadLocalSummary()

  # if remoteSummary && localSummary
  #   remoteRevision = remoteSummary[:info][:filesRevision]
  #   localRevision = localSummary[:info][:filesRevision]
  #   return remoteRevision > localRevision ? remoteSummary : localSummary
  # end
  #return remoteSummary if remoteSummary
  # return localSummary if localSummary
  #FallbackInitialSummary
end

def updateSummaryIfFilesChanged(currentSummary)
  sourceSummary = loadSourceSummary()
  filesChanged = (currentSummary[:files] != sourceSummary[:files])

  puts "filesChanged: #{filesChanged}"

  if filesChanged
    sourceRevision = sourceSummary[:info][:filesRevision]
    puts "filesRevision: #{sourceRevision} --> #{sourceRevision + 1}"
    updatedSummary = mergeSummary(currentSummary, sourceSummary)
    summaryJsonText = JSON.pretty_generate(updatedSummary)
    File.write("./dist/summary.json", summaryJsonText)
  else
    sourceRevision = sourceSummary[:info][:filesRevision]
    puts "filesRevision: #{sourceRevision}"
    summaryJsonText = JSON.pretty_generate(sourceSummary)
    File.write("./dist/summary.json", summaryJsonText)
  end
end

def buildAllProjects()
  reqUpdateSummary = ARGV[0] == '--updateSummary'
  cleanPreviousFiles()
  stats = buildProjects()
  if reqUpdateSummary
    currentSummary = makeCurrentSummary(stats)
    updateSummaryIfFilesChanged(currentSummary)
  end
end

if __FILE__ == $0
  buildAllProjects() 
end
