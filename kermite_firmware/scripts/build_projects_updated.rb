
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
    .filter{|dir|
      ['rules.mk', 'layout.json'].all?{|fileName| File.exists?(File.join("src/projects", dir, fileName)) }
    }

  puts "projects updated: " + projectNames.to_s

  projectNames.each{|projectName|
    puts "building #{projectName} ..."

    `make purge`
    #`touch src/projects/#{projectName}/rules.mk`
    makeRes = `make #{projectName}:build`
    #puts makeRes
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

  puts "done"
end

if __FILE__ == $0
  buildUpdateProjects()
end
