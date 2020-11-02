# frozen_string_literal: true

require 'fileutils'
require 'json'
require 'open3'
require 'digest/md5'

#------------------------------------------------------------

def pull_resource_store_repo
  `git clone https://github.com/yahiro07/KermiteResourceStore.git KRS` unless File.exist?('KRS')
end

def copy_resources_to_local_resource_store_repo
  FileUtils.rm_rf('./KRS/resources')
  FileUtils.copy_entry('./dist', './KRS/resources')
end

#------------------------------------------------------------

def gather_target_project_paths
  Dir.glob('./src/projects/**/rules.mk')
     .map { |path| File.dirname(path) }
     .select { |path| File.exist?(File.join(path, 'layout.json')) }
     .map { |path| path.sub('./src/projects/', '') }
end

def load_firmware_common_revisions
  version_file_path = './src/modules/versions.h'
  content = File.read(version_file_path)
  {
    storageFormatRevision: content.match(/^\#define CONFIG_STORAGE_FORMAT_REVISION (\d+)$/)[1].to_i,
    messageProtocolRevision: content.match(/^\#define RAWHID_MESSAGE_PROTOCOL_REVISION (\d+)$/)[1].to_i
  }
end

METADATA_JSON_SCHEME_DESC_SUCCESS_PROJECT = {
  buildResult: 'success',
  releaseBuildRevision: 'number',
  buildTimestamp: 'string',
  storageFormatRevision: 'number',
  messageProtocolRevision: 'number',
  flashUsage: 'number',
  ramUsage: 'number',
  binFileSize: 'number',
  hexFileMD5: 'string'
}.freeze

METADATA_JSON_SCHEME_DESC_FAILURE_PROJECT = {
  buildResult: 'failure',
  releaseBuildRevision: 'number',
  buildTimestamp: 'string'
}.freeze

def load_project_source_attributes(project_path)
  metadata_file_path = "./KRS/resources/variants/#{project_path}/metadata.json"

  obj = {}
  if File.exist?(metadata_file_path)
    text = File.read(metadata_file_path)
    obj = JSON.parse(text, { symbolize_names: true })
  end

  {
    releaseBuildRevision: obj[:releaseBuildRevision] || 0,
    hexFileMD5: obj[:hexFileMD5],
    buildTimestamp: obj[:buildTimestamp]
  }
end

def make_project_build(project_path, build_revision)
  command = "make #{project_path}:build RELEASE_REVISION=#{build_revision}"
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
    { result: :ok, flash: usage_prog, ram: usage_data }
  else
    { result: :ng, error_log: "firmware footprint overrun (FLASH: #{usage_prog}, RAM: #{usage_data})" }
  end
end

def read_output_hex_info(project_path)
  core_name = File.basename(project_path)
  hex_file_path = "./build/#{project_path}/#{core_name}.hex"
  {
    size: File.size(hex_file_path),
    md5: Digest::MD5.file(hex_file_path).to_s
  }
end

def project_build_pipeline(project_path, source_attrs)
  build_revision = source_attrs[:releaseBuildRevision]
  hex_file_md5 = source_attrs[:hexFileMD5]

  `make #{project_path}:purge`

  build_res = make_project_build(project_path, build_revision)
  return build_res if build_res[:result] == :ng

  size_res = check_binary_size(project_path)
  return size_res if size_res[:result] == :ng

  info0 = read_output_hex_info(project_path)
  new_hex_file_md5 = info0[:md5]

  if new_hex_file_md5 == hex_file_md5
    build_timestamp = source_attrs[:buildTimestamp]
    build_timestamp = Time.now.to_s if build_timestamp.nil? || build_timestamp.empty?

    return { result: :ok, updated_attrs: {
      releaseBuildRevision: build_revision,
      buildTimestamp: build_timestamp,
      flashUsage: size_res[:flash],
      ramUsage: size_res[:ram],
      hexFileSize: info0[:size],
      hexFileMD5: hex_file_md5
    } }
  end

  build_revision += 1

  # _touch_res = `touch ./src/modules/versions.h`
  _purge_res = `make #{project_path}:purge`
  make_project_build(project_path, build_revision)

  info1 = read_output_hex_info(project_path)
  new_hex_file_md5_1 = info1[:md5]

  { result: :ok, updated_attrs: {
    releaseBuildRevision: build_revision,
    buildTimestamp: Time.now.to_s,
    flashUsage: size_res[:flash],
    ramUsage: size_res[:ram],
    hexFileSize: info1[:size],
    hexFileMD5: new_hex_file_md5_1
  } }
end

def make_failure_metadata_content(source_attrs)
  {
    buildResult: 'failure',
    releaseBuildRevision: source_attrs[:releaseBuildRevision],
    buildTimestamp: source_attrs[:buildTimestamp]
  }
end

def make_success_metadata_content(source_attrs, updated_attrs, common_revisions)
  sa = source_attrs
  ua = updated_attrs
  {
    buildResult: 'success',
    releaseBuildRevision: ua[:releaseBuildRevision] || sa[:releaseBuildRevision],
    buildTimestamp: ua[:buildTimestamp] || sa[:buildTimestamp],
    storageFormatRevision: common_revisions[:storageFormatRevision],
    messageProtocolRevision: common_revisions[:messageProtocolRevision],
    flashUsage: ua[:flashUsage] || sa[:flashUsage],
    ramUsage: ua[:ramUsage] || sa[:ramUsage],
    hexFileSize: ua[:hexFileSize] || sa[:hexFileSize],
    hexFileMD5: ua[:hexFileMD5] || sa[:hexFileMD5]
  }
end

def build_project_entry(project_path, common_revisions)
  puts "building #{project_path} ..."

  core_name = File.basename(project_path)
  src_dir = "./src/projects/#{project_path}"
  mid_dir = "./build/#{project_path}"
  dest_dir = "./dist/variants/#{project_path}"

  FileUtils.mkdir_p(dest_dir)

  source_attrs = load_project_source_attributes(project_path)

  build_res = project_build_pipeline(project_path, source_attrs)

  FileUtils.copy("#{src_dir}/layout.json", "#{dest_dir}/layout.json")
  FileUtils.copy_entry("#{src_dir}/profiles", "#{dest_dir}/profiles") if File.exist?("#{src_dir}/profiles")

  if build_res[:result] == :ng
    error_log = build_res[:error_log]
    puts(error_log)
    File.write("#{dest_dir}/build_error.log", error_log)
    metadata_obj = make_failure_metadata_content(source_attrs)
    File.write("#{dest_dir}/metadata.json", JSON.pretty_generate(metadata_obj))
    puts "build #{project_path} ... NG"
    puts
    false
  else
    FileUtils.copy("#{mid_dir}/#{core_name}.hex", "#{dest_dir}/#{core_name}.hex")
    updated_attrs = build_res[:updated_attrs]
    metadata_obj = make_success_metadata_content(source_attrs, updated_attrs, common_revisions)
    File.write("#{dest_dir}/metadata.json", JSON.pretty_generate(metadata_obj))
    # print "\e[A\e[K"
    puts "build #{project_path} ... OK"
    true
  end
end

def build_projects
  `make clean`
  FileUtils.mkdir('./dist')
  project_paths = gather_target_project_paths
  puts "projects: #{project_paths}"
  common_revisions = load_firmware_common_revisions
  results = project_paths.map { |project_path| build_project_entry(project_path, common_revisions) }
  num_success = results.count(true)
  num_total = results.length
  puts "build stats: #{num_success}/#{num_total}"
  { success: num_success, total: num_total }
end

#------------------------------------------------------------

def read_os_version
  is_mac_os = RUBY_PLATFORM.include?('darwin')
  is_linux = RUBY_PLATFORM.include?('linux')
  is_windows = RUBY_PLATFORM.include?('windows')
  if is_mac_os
    "#{`sw_vers -productName`.strip} #{`sw_vers -productVersion`.strip}"
  elsif is_linux
    `lsb_release -d`.sub('Description:', '').strip
  elsif is_windows
    `ver`
  else
    ''
  end
end

def read_env_versions
  os_version = read_os_version
  avr_gcc_version = `avr-gcc -v 2>&1 >/dev/null | grep "gcc version"`.strip
  make_version = `make -v | grep "GNU Make"`.strip
  {
    OS: os_version,
    'avr-gcc': avr_gcc_version,
    make: make_version
  }
end

SUMMARY_JSON_SCHEME_DESC = {
  info: {
    buildStats: {
      success: 'number',
      total: 'number'
    },
    environment: {
      OS: 'string',
      'avr-gcc': 'string',
      make: 'string'
    },
    updatedAt: 'string',
    filesRevision: 'number'
  },
  projects: {
    project_path_1: {
      path: 'string',
      id: 'string',
      name: 'string',
      status: 'success | failure',
      revision: 'number',
      updatedAt: 'string',
      hexFileSize: 'number'
    },
    project_path_2: {
      # ...
    }
    # ...
  }
}.freeze

def make_summary_file_content(stats, files_revision)
  file_paths = Dir.glob('./dist/variants/**/*').select { |f| File.file?(f) }
  layout_file_paths = file_paths.filter { |f| f.end_with?('layout.json') }
  projects_dict = layout_file_paths.map do |file_path|
    project_path = File.dirname(file_path.sub('./dist/variants/', ''))
    layout_content = JSON.parse(File.read(file_path), { symbolize_names: true })
    project_id = layout_content[:projectId]
    project_name = layout_content[:projectName]

    metadata_file_path = "./dist/variants/#{project_path}/metadata.json"
    metadata_content = JSON.parse(File.read(metadata_file_path), { symbolize_names: true })
    build_status = metadata_content[:buildResult]
    build_revision = metadata_content[:releaseBuildRevision]
    updated_at = metadata_content[:buildTimestamp]
    hex_file_size = metadata_content[:hexFileSize]
    [project_path, {
      path: project_path,
      id: project_id,
      name: project_name,
      status: build_status,
      revision: build_revision,
      updatedAt: updated_at,
      hexFileSize: hex_file_size
    }]
  end.to_h

  {
    info: {
      buildStats: stats,
      environment: read_env_versions,
      updatedAt: Time.now.to_s,
      filesRevision: files_revision
    },
    projects: projects_dict
  }
end

def output_summary_file(stats, change_res)
  files_changed = change_res[:files_changed]
  files_revision = change_res[:files_revision]
  if files_changed
    saving_summary_obj = make_summary_file_content(stats, files_revision)
    saving_summary_text = JSON.pretty_generate(saving_summary_obj)
    File.write('./dist/summary.json', saving_summary_text)
  else
    FileUtils.copy('./KRS/resources/summary.json', './dist/summary.json')
  end
end

#------------------------------------------------------------

def make_files_md5_dict
  file_paths = Dir.glob('./dist/variants/**/*').select { |f| File.file?(f) }
  file_paths.map do |file_path|
    rel_path = file_path.sub('./dist/', '')
    md5 = Digest::MD5.file(file_path).to_s
    [rel_path.intern, md5]
  end.to_h
end

INDEX_JSON_SCHEME_DESC = {
  updatedAt: 'string',
  filesRevision: 'number',
  files: {
    file_path_1: 'string',
    fiel_path_2: 'string'
    # ...
  }
}.freeze

def make_index_json_content(revision, files_md5_dict, updated_at)
  {
    updatedAt: updated_at,
    filesRevision: revision,
    files: files_md5_dict
  }
end

def load_source_index
  index_file_path = './KRS/resources/index.json'
  if File.exist?(index_file_path)
    text = File.read(index_file_path)
    return JSON.parse(text, { symbolize_names: true })
  end
  nil
end

def update_index_if_files_changed
  source_index = load_source_index
  files_md5_dict = make_files_md5_dict

  files_changed = !source_index || source_index[:files] != files_md5_dict
  files_revision = source_index && source_index[:filesRevision] || 0
  updated_at = source_index && source_index[:updatedAt] || Time.now.to_s

  puts "filesChanged: #{files_changed}"
  if files_changed
    puts "filesRevision: #{files_revision} --> #{files_revision + 1}"
    files_revision += 1
    updated_at = Time.now.to_s
  else
    puts "filesRevision: #{files_revision}"
  end

  saving_index_obj = make_index_json_content(files_revision, files_md5_dict, updated_at)
  saving_index_text = JSON.pretty_generate(saving_index_obj)
  File.write('./dist/index.json', saving_index_text)

  {
    files_changed: files_changed,
    files_revision: files_revision
  }
end

#------------------------------------------------------------

def build_app_project_distributions
  pull_resource_store_repo
  stats = build_projects
  change_res = update_index_if_files_changed
  output_summary_file(stats, change_res)
  copy_resources_to_local_resource_store_repo
  puts 'done'
end

build_app_project_distributions if __FILE__ == $PROGRAM_NAME
