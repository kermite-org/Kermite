require 'open3'
require 'fileutils'
require 'digest/md5'
require 'json'

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
  [numTotal, numSuccess]
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

def makeSummary(stats)
  filePaths = Dir.glob("./dist/variants/**/*").select{|f| File.file?(f)}
  filesMd5Dict = filePaths.map{|filePath|
    relPath = filePath.sub("./dist/", "")
    md5 = Digest::MD5.file(filePath).to_s
    [relPath, md5]
  }.to_h

  root = {
    info: {
      buildStats:{
        success: stats[1],
        total: stats[0],
      },
      environment: getEnvVersions(),
      executedAt: Time.now.to_s,
      filesRevision: 0
    },
    files: filesMd5Dict
  }

  summaryJsonText = JSON.pretty_generate(root)
  File.write("./dist/summary.json", summaryJsonText)
end

def copyToResourceStoreDirectory
  resourceStoreDir = '../../../KermiteResourceStore'
  if Dir.exists?(resourceStoreDir)
    FileUtils.copy_entry("./dist", "#{resourceStoreDir}/resources")
  end
end

def buildAndDeploy
  stats = buildProjects()
  makeSummary(stats)
  copyToResourceStoreDirectory()
end

if __FILE__ == $0
  buildAndDeploy()
end
