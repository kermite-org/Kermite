require 'json'

AbortOnError = ARGV.include?('--abortOnError')

def get_all_project_paths
  Dir.glob('./src/projects/**/rules.mk')
     .map { |path| File.dirname(path) }
     .select do |path|
    ['layout.json', 'config.h'].all? { |file_name| File.exist?(File.join(path, file_name)) }
  end
     .map { |path| path.sub('./src/projects/', '') }
end

def check_project_ids
  project_paths = get_all_project_paths
  project_infos = project_paths.map do |project_path|
    layout_file_path = "./src/projects/#{project_path}/layout.json"
    config_file_path = "./src/projects/#{project_path}/config.h"
    layout_content = JSON.parse(File.read(layout_file_path), { symbolize_names: true })
    project_id = layout_content[:projectId]
    project_name = layout_content[:projectName]

    config_content = File.read(config_file_path)
    config_project_id = config_content.match(/^#define PROJECT_ID "([a-zA-Z0-9]+)"$/) ? Regexp.last_match(1) : nil

    unless project_name
      puts "projectName is not defined in #{project_path}/layout.json"
      exit(1) if AbortOnError
    end

    unless project_id
      puts "projectId is not defined in #{project_path}/layout.json"
      exit(1) if AbortOnError
    end

    unless config_project_id
      puts "PROJECT_ID is not defined in #{project_path}/config.h"
      exit(1) if AbortOnError
    end

    unless project_id.match(/^[a-zA-Z0-9]{8}$/)
      puts "invalid Project ID #{project_id} for #{project_path}"
      exit(1) if AbortOnError
    end

    if project_id != config_project_id
      puts "inconsistent Project IDs in #{project_path}/config.h and #{project_path}/layout.json"
      exit(1) if AbortOnError
    end

    {
      project_path: project_path,
      project_id: project_id,
      project_name: project_name
    }
  end

  all_project_ids = project_infos.map { |info| info[:project_id] }
  duprecated_project_ids = all_project_ids.select { |e| all_project_ids.count(e) > 1 }.uniq

  if duprecated_project_ids.length > 0
    bad_project_id = duprecated_project_ids[0]
    bad_project_paths = project_infos.filter { |info| info[:project_id] == bad_project_id }
                                     .map { |info| info[:project_path] }
    puts "Project ID confliction. #{bad_project_id} is used for #{bad_project_paths}"
    exit(1) if AbortOnError
  end
end

check_project_ids if __FILE__ == $PROGRAM_NAME
