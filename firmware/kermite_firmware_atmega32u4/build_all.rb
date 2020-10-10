require 'open3'
require 'fileutils'
require 'digest/md5'
require 'json'

#build all firmware resources and copy them to KermiteResourceStore project directory

def buildProject(projectName)
  coreName = File.basename(projectName)
  srcDir = "./src/projects/#{projectName}"
  midDir = "./build/#{projectName}"
  destDir = "./dist/variants/#{projectName}"
  FileUtils.mkdir_p(destDir)

  command = "make #{projectName}:build"
  stdout, stderr, status = Open3.capture3(command);
  if status == 0
    FileUtils.copy("#{midDir}/#{coreName}.hex", "#{destDir}/#{coreName}.hex")
  else
    File.write("#{destDir}/build_error.log",">#{command}\r\n#{stdout}#{stderr}")
  end

  FileUtils.copy("#{srcDir}/layout.json", "#{destDir}/layout.json")
  if File.exists?("#{srcDir}/profiles")
    FileUtils.copy_entry("#{srcDir}/profiles", "#{destDir}/profiles")
  end
end

def buildProjects()
  projectNames = Dir.glob("./src/projects/**/rules.mk")
    .map{|path| File.dirname(path)}
    .filter{|path| File.exists?(File.join(path, 'layout.json'))}
    .map{|path| path.sub('./src/projects/', '') }

  projectNames.each{|projectName| 
    buildProject(projectName)
  }
end

def makeSummary()
  filePaths = Dir.glob("./dist/variants/**/*").select{|f| File.file?(f)}
  filesMd5Dict = filePaths.map{|filePath|
    relPath = filePath.sub("./dist/", "")
    md5 = Digest::MD5.file(filePath).to_s
    [relPath, md5]
  }.to_h
  summaryJsonText = JSON.pretty_generate(filesMd5Dict)
  File.write("./dist/summary.json", summaryJsonText)
end

def copyToResourceStoreDirectory
  resourceStoreDir = '../../../KermiteResourceStore'
  if Dir.exists?(resourceStoreDir)
    FileUtils.copy_entry("./dist", "#{resourceStoreDir}/resources")
  end
end

if __FILE__ == $0
  buildProjects()
  makeSummary()
  copyToResourceStoreDirectory()
end
