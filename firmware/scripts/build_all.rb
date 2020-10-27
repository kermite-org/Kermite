# frozen_string_literal: true

require 'open3'
require 'json'

BuildUpdatedOnly = ARGV.include?('--updatedOnly')
AbortOnError = ARGV.include?('--abortOnError')

def get_all_project_names
  Dir.glob('./src/projects/**/rules.mk')
     .map { |path| File.dirname(path) }
     .select { |path| File.exist?(File.join(path, 'layout.json')) }
     .map { |path| path.sub('./src/projects/', '') }
end

def get_updated_project_names
  `git diff --name-only HEAD~`
    .split(/\R/)
    .map { |path| File.dirname(path) }
    .uniq
    .filter { |path| path.start_with?(Projects_dir) }
    .map { |path| path.sub(Projects_dir, '') }
    .filter do |dir|
    ['rules.mk', 'layout.json'].all? { |file_name| File.exist?(File.join('src/projects', dir, file_name)) }
  end
end

def make_project_build(project_name)
  command = "make #{project_name}:build"
  _stdout, stderr, status = Open3.capture3(command)
  return { result: :ok } if status == 0

  { result: :ng, error_log: ">#{command}\n#{stderr}" }
end

def check_binary_size(project_name)
  size_command = "make #{project_name}:size"
  size_output_lines = `#{size_command}`
  usage_prog = size_output_lines.match(/^Program.*\(([\d.]+)% Full\)/)[1].to_f
  usage_data = size_output_lines.match(/^Data.*\(([\d.]+)% Full\)/)[1].to_f
  if usage_prog < 100.0 && usage_data < 100.0
    { result: :ok }
  else
    { result: :ng, error_log: "firmware footprint overrun (FLASH: #{usage_prog}, RAM: #{usage_data})" }
  end
end

def build_project(project_name)
  puts "building #{project_name} ..."

  `make #{project_name}:purge`

  res = make_project_build(project_name)
  res = check_binary_size(project_name) if res[:result] == :ok

  if res[:result] == :ok
    print "\e[A\e[K"
    puts "build #{project_name} ... OK"
    true
  else
    puts(res[:error_log])
    if AbortOnError
      warn("abort: failed to build #{project_name}")
      exit(1)
    end
    puts "build #{project_name} ... NG"
    puts
    false
  end
end

def check_breed_ids
  layout_file_paths = Dir.glob('./src/projects/**/layout.json')
  breed_names_dict = layout_file_paths.map do |file_path|
    project_name = File.dirname(file_path.sub('./src/projects/', ''))
    layout_content = JSON.parse(File.read(file_path), { symbolize_names: true })
    breed_id = layout_content[:breedId]
    [project_name, breed_id]
  end.to_h

  all_breed_ids = breed_names_dict.values
  duprecated_breed_ids = all_breed_ids.select { |e| all_breed_ids.count(e) > 1 }.uniq

  if duprecated_breed_ids.length > 0
    bad_breed_id = duprecated_breed_ids[0]
    bad_project_names = breed_names_dict.keys.filter { |key| breed_names_dict[key] == bad_breed_id }
    puts "breedId confliction! #{bad_breed_id} is used for #{bad_project_names}"
    exit(1) if AbortOnError
  end
end

def build_projects
  project_names = BuildUpdatedOnly ? get_updated_project_names : get_all_project_names
  `make clean`
  puts "target projects: #{project_names}"
  results = project_names.map { |project_name| build_project(project_name) }
  num_success = results.count(true)
  num_total = results.length
  puts "build_stats #{num_success}/#{num_total}" if num_total > 0
  check_breed_ids
  puts 'done'
end

build_projects if __FILE__ == $0
