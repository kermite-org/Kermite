#assuming executed at regular intervals by cron or launchd

def execute(cmd)
  puts ">#{cmd}"
  res = `#{cmd}`
  puts res
  puts if res != ""
  res
end

def updateResourcesIfPushed

  res1 = execute("git pull")
  if !res1.include?("Already up to date")
    execute("ruby scripts/build_all_resources.rb")

    puts "cd to ../../../KermiteResourceStore"
    Dir.chdir("../../../KermiteResourceStore")

    res3 = execute("git status")
    if res3.include?("Changes not staged for commit")
      execute("git add -A")
      execute('git commit -m "update resources"')
      execute('git push')
      puts "resouces updation complete!"
      return
    end
  end
  puts "nothing changed"
end

updateResourcesIfPushed()
