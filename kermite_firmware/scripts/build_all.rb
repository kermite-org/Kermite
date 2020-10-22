require 'open3'

ProjectsDir = "kermite_firmware/src/projects/"
RegardSizeExcessAsError = true

BuildUpdatedOnly = ARGV.include?("--updatedOnly")
AbortOnError = ARGV.include?("--abortOnError")

def checkFirmwareSize(logText)
  mProg = logText.match(/^Program.*\(([\d\.]+)\% Full\)/)
  mData = logText.match(/^Data.*\(([\d\.]+)\% Full\)/)
  if mProg && mData
    usageProg = mProg[1].to_f
    usageData = mData[1].to_f
    if usageProg < 100.0 && usageData < 100.0
      return { res: :ok }
    else
      return { res: :ng, detail: "FLASH:#{usageProg}%, RAM:#{usageData}%" }
    end
  end
  
  return { res: :unknown }
end

def getAllProjectNames()
  return Dir.glob("./src/projects/**/rules.mk")
    .map{|path| File.dirname(path)}
    .select{|path| File.exists?(File.join(path, 'layout.json'))}
    .map{|path| path.sub('./src/projects/', '') }
end

def getUpdatedProjectNames()
  return `git diff --name-only HEAD~`
    .split(/\R/)
    .map{|path| File.dirname(path)}
    .uniq
    .filter{|path| path.start_with?(ProjectsDir) }
    .map{|path| path.sub(ProjectsDir, "")}
    .filter{|dir|
      ['rules.mk', 'layout.json'].all?{|fileName| File.exists?(File.join("src/projects", dir, fileName)) }
    }
end


def buildProject(projectName)

  puts "building #{projectName} ..."

  srcDir = "./src/projects/#{projectName}"

  `make purge`
  command = "make #{projectName}:build"
  stdout, stderr, status = Open3.capture3(command);

  buildSuccess = status == 0

  if buildSuccess && RegardSizeExcessAsError
    sizeCommand = "make #{projectName}:size"
    sizeOutputLines = `#{sizeCommand}`

    sizeRes = checkFirmwareSize(sizeOutputLines)
    if sizeRes[:res] == :ng
      buildSuccess = false
      command = sizeCommand
      stdout = "#{sizeOutputLines.strip()}\n\n"
      stderr = "firmware footprint overrun (#{sizeRes[:detail]})\n"
    end
  end

  #puts stdout

  if stderr != ""
    puts(stderr)
  else
    print "\e[A\e[K"
  end
  puts "build #{projectName} ... #{buildSuccess ? 'OK': 'NG'}"
  puts if !buildSuccess


  if !buildSuccess && AbortOnError
    STDERR.puts "abort: failed to build #{projectName}"
    exit(1)
  end

  buildSuccess
end


def buildProjects()

  projectNames = BuildUpdatedOnly ? getUpdatedProjectNames() : getAllProjectNames()

  puts "target projects: " + projectNames.to_s
  numTotal = 0
  numSuccess = 0
  projectNames.each{|projectName| 
    success = buildProject(projectName)
    numSuccess += 1 if success
    numTotal += 1
  }
  puts "buildStats #{numSuccess}/#{numTotal}" if numTotal > 0
  puts "done"
end

if __FILE__ == $0
  buildProjects()
end
