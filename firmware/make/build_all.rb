# frozen_string_literal: true

require 'open3'

BuildUpdatedOnly = ARGV.include?('--updatedOnly')
AbortOnError = ARGV.include?('--abortOnError')

def get_all_project_paths
  Dir.glob('./src/projects/**/rules.mk')
     .map { |path| File.dirname(path) }
     .select { |path| File.exist?(File.join(path, 'project.json')) }
     .map { |path| path.sub('./src/projects/', '') }
end

def get_updated_project_paths
  `git diff --name-only HEAD~`
    .split(/\R/)
    .map { |path| File.dirname(path) }
    .uniq
    .filter { |path| path.start_with?(Projects_dir) }
    .map { |path| path.sub(Projects_dir, '') }
    .filter do |dir|
    ['rules.mk', 'project.json'].all? { |file_name| File.exist?(File.join('src/projects', dir, file_name)) }
  end
end

def make_project_build(project_path)
  command = "make #{project_path}:build"
  _stdout, stderr, status = Open3.capture3(command)
  return { result: :ok } if status == 0

  { result: :ng, error_log: ">#{command}\n#{stderr}" }
end

def check_binary_size(project_path)
  size_command = "make #{project_path}:size"
  size_output_lines = `#{size_command}`
  usage_prog = size_output_lines.match(/^Program.*\(([\d.]+)% Full\)/)[1].to_f
  usage_data = size_output_lines.match(/^Data.*\(([\d.]+)% Full\)/)[1].to_f
  if usage_prog < 100.0 && usage_data < 100.0
    { result: :ok }
  else
    { result: :ng, error_log: "firmware footprint overrun (FLASH: #{usage_prog}, RAM: #{usage_data})" }
  end
end

def build_project(project_path)
  puts "building #{project_path} ..."

  `make #{project_path}:purge`

  res = make_project_build(project_path)
  res = check_binary_size(project_path) if res[:result] == :ok

  if res[:result] == :ok
    print "\e[A\e[K"
    puts "build #{project_path} ... OK"
    true
  else
    puts(res[:error_log])
    if AbortOnError
      warn("abort: failed to build #{project_path}")
      exit(1)
    end
    puts "build #{project_path} ... NG"
    puts
    false
  end
end

def build_projects
  project_paths = BuildUpdatedOnly ? get_updated_project_paths : get_all_project_paths
  `make clean`
  puts "target projects: #{project_paths}"
  results = project_paths.map { |project_path| build_project(project_path) }
  num_success = results.count(true)
  num_total = results.length
  puts "build_stats #{num_success}/#{num_total}" if num_total > 0
  puts 'done'
end

build_projects if __FILE__ == $0
