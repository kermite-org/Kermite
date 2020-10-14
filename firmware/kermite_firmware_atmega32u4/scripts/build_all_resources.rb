require 'open3'
require 'fileutils'
require 'digest/md5'
require 'json'
require 'net/https'
require 'uri'

#build all firmware resources and copy them to KermiteResourceStore project directory

def deleteFileIfExist(fpath)
  File.delete(fpath) if File.exist?(fpath)
end

def buildProject(projectName)
  coreName = File.basename(projectName)
  srcDir = "./src/projects/#{projectName}"
  midDir = "./build/#{projectName}"
  destDir = "./dist/variants/#{projectName}"
  FileUtils.mkdir_p(destDir)

  command = "make #{projectName}:build"
  stdout, stderr, status = Open3.capture3(command);
  buildSuccess = status == 0
  if buildSuccess
    FileUtils.copy("#{midDir}/#{coreName}.hex", "#{destDir}/#{coreName}.hex")
    deleteFileIfExist("#{destDir}/build_error.log")
  else
    deleteFileIfExist("#{destDir}/#{coreName}.hex")
    File.write("#{destDir}/build_error.log",">#{command}\r\n#{stdout}#{stderr}")
  end

  FileUtils.copy("#{srcDir}/layout.json", "#{destDir}/layout.json")
  if File.exists?("#{srcDir}/profiles")
    FileUtils.copy_entry("#{srcDir}/profiles", "#{destDir}/profiles")
  end

  buildSuccess
end

def buildProjects()
  projectNames = Dir.glob("./src/projects/**/rules.mk")
    .map{|path| File.dirname(path)}
    .filter{|path| File.exists?(File.join(path, 'layout.json'))}
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

def getEnvVersions()
  osVersion = "#{`sw_vers -productName`.strip} #{`sw_vers -productVersion`.strip}"
  avrGccVersion = `avr-gcc -v 2>&1 >/dev/null | grep "gcc version"`.strip.match(/\((.*)\)/)[1]
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
    [relPath, md5]
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

def loadLocalSummary()
  localSummaryFilePath = "./dist/summary.json"
  if(File.exists?(localSummaryFilePath))
    text = File.read(localSummaryFilePath)
    return JSON.parse(text, {:symbolize_names => true})
  end
  nil
end

def loadSourceSummary()
  remoteSummaryUrl = 'https://raw.githubusercontent.com/yahiro07/KermiteResourceStore/master/resources/summary.json'
  remoteSummary = fetchJson(remoteSummaryUrl)
  puts 'failed to fetch remote summary' if remoteSummary == nil

  localSummary = loadLocalSummary()

  if remoteSummary && localSummary
    remoteRevision = remoteSummary[:info][:filesRevision]
    localRevision = localSummary[:info][:filesRevision]
    return remoteRevision > localRevision ? remoteSummary : localSummary
  end
  return remoteSummary if remoteSummary
  return localSummary if localSummary

  raise 'No source summary, both remote and local summaries are unavailable.'
end

def updateSummaryIfFilesChanged(currentSummary)
  sourceSummary = loadSourceSummary()

  filesChanged = JSON.generate(currentSummary[:files]) != 
    JSON.generate(sourceSummary[:files])

  puts "filesChanged: #{filesChanged}"

  if filesChanged
    sourceRevision = sourceSummary[:info][:filesRevision]
    puts "filesRevision: #{sourceRevision} --> #{sourceRevision + 1}"
    updatedSummary = mergeSummary(currentSummary, sourceSummary)
    summaryJsonText = JSON.pretty_generate(updatedSummary)
    File.write("./dist/summary.json", summaryJsonText)
  end
end

def copyToResourceStoreDirectory()
  resourceStoreDir = '../../../KermiteResourceStore'
  if Dir.exists?(resourceStoreDir)
    FileUtils.rm_rf("#{resourceStoreDir}/resources")
    FileUtils.copy_entry("./dist", "#{resourceStoreDir}/resources")
  end
end

def buildAndDeploy()
  stats = buildProjects()
  currentSummary = makeCurrentSummary(stats)
  updated = updateSummaryIfFilesChanged(currentSummary)
  copyToResourceStoreDirectory() if updated
end

if __FILE__ == $0
  buildAndDeploy()
end
