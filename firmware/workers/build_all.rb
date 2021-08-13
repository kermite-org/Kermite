require 'open3'
require 'pathname'

AbortOnError = ARGV.include?('--abortOnError')

def get_all_project_variation_paths
  Dir.glob('./src/projects/**/rules.mk')
     .map { |path| File.dirname(path) }
     .map { |path| path.sub('./src/projects/', '') }
     .select { |path| !(path.start_with?('dev') || path.start_with?('study')) }
     .sort
end

def make_firmware_build(project_path, variation_name)
  command = "make #{project_path}:#{variation_name}:build"
  _stdout, stderr, status = Open3.capture3(command)
  return { result: :ok } if status == 0

  { result: :ng, error_log: ">#{command}\n#{stderr}" }
end

def build_firmware(project_path, variation_name)
  puts "build #{project_path}--#{variation_name} ..."

  # `make #{project_path}:#{variation_name}:clean`
  res = make_firmware_build(project_path, variation_name)
  if res[:result] == :ok
    print "\e[A\e[K"
    puts "build #{project_path}--#{variation_name} ... OK"
    true
  else
    puts(res[:error_log])
    if AbortOnError
      warn("abort: failed to build #{project_path}--#{variation_name}")
      exit(1)
    end
    puts "build #{project_path}--#{variation_name} ... NG"
    puts
    false
  end
end

def build_project_variation(project_variation_path)
  project_path, variation_name = File.split(project_variation_path)
  build_firmware(project_path, variation_name)
end

def build_projects
  project_variation_paths = get_all_project_variation_paths
  # `make clean`
  puts "target project variations: #{project_variation_paths}"
  results = project_variation_paths.map { |it| build_project_variation(it) }
  num_success = results.count(true)
  num_total = results.length
  puts "build_stats #{num_success}/#{num_total}" if num_total > 0
  puts 'done'
end

build_projects if __FILE__ == $0
