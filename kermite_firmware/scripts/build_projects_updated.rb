
ProjectsDir = "kermite_firmware/src/projects/"
RegardSizeExcessAsError = true

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


def buildUpdateProjects()
  projectNames = `git diff --name-only HEAD~`
    .split(/\R/)
    .map{|path| File.dirname(path)}
    .uniq
    .filter{|path| path.start_with?(ProjectsDir) }
    .map{|path| path.sub(ProjectsDir, "")}

  puts "projects updated: " + projectNames.to_s

  projectNames.each{|projectName|
    puts "building #{projectName} ..."

    `make clean`
    `make #{projectName}:build`
    if $? != 0
      puts
      puts "error while building #{projectName}"
      exit(1)
    end
    sizeCommandOutput = `make #{projectName}:size`
    sizeRes = checkFirmwareSize(sizeCommandOutput)
    if sizeRes[:res] == :ng
      puts
      puts "firmware footprint overrun (#{sizeRes[:detail]})"
      puts
      puts "error while building #{projectName}"
      exit(1)
    end

    print "\e[A\e[K"
    puts "build #{projectName} ... ok"
  }

  puts "complete!"
end

if __FILE__ == $0
  buildUpdateProjects()
end
