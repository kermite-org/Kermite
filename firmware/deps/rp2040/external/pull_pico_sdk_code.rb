require 'fileutils'
require 'pathname'

SrcPicoSdkDir = '.tmp/pico-sdk'.freeze
DstPicoSdkDir = './pico_sdk'.freeze

def path_parent(a)
  Pathname.new(a).parent
end

def path_join(*args)
  File.join(*args)
end

def copy_single_file(relative_file_path)
  src_file_path = path_join(SrcPicoSdkDir, relative_file_path)
  dst_file_path = path_join(DstPicoSdkDir, relative_file_path)

  FileUtils.mkdir_p(path_parent(dst_file_path))
  FileUtils.copy_entry(src_file_path, dst_file_path)
end

def copy_source_files_direct_under(relative_folder_path)
  src_folder_path = path_join(SrcPicoSdkDir, relative_folder_path)
  dst_folder_path = path_join(DstPicoSdkDir, relative_folder_path)

  FileUtils.mkdir_p(dst_folder_path)

  file_names = Dir.entries(src_folder_path).filter do |p|
    ['.h', '.c'].include?(File.extname(p))
  end
  file_names.map  do |file_name|
    src_file_path = path_join(src_folder_path, file_name)
    dst_file_path = path_join(dst_folder_path, file_name)
    FileUtils.copy(src_file_path, dst_file_path)
  end
end

def copy_folder_recursive(relative_folder_path)
  src_folder_path = path_join(SrcPicoSdkDir, relative_folder_path)
  dst_folder_path = path_join(DstPicoSdkDir, relative_folder_path)

  FileUtils.mkdir_p(path_parent(dst_folder_path))
  FileUtils.copy_entry(src_folder_path, dst_folder_path)
end

def copy_sub_folders_recursive(relative_folder_path, options = {})
  src_folder_path = path_join(SrcPicoSdkDir, relative_folder_path)
  dst_folder_path = path_join(DstPicoSdkDir, relative_folder_path)

  sub_folder_names = []

  if options[:includes]
    sub_folder_names = options[:includes]
  else
    exclude_paths = ['.', '..'].concat(options[:excludes] || [])
    sub_folder_names = Dir.entries(src_folder_path)
                          .filter { |f| !exclude_paths.include?(f) }
                          .filter { |f| File.directory? File.join(src_folder_path, f) }
  end

  FileUtils.mkdir_p(dst_folder_path)

  sub_folder_names.each do |folder_name|
    src_folder_entry_path = path_join(SrcPicoSdkDir, relative_folder_path, folder_name)
    dst_folder_entry_path = path_join(DstPicoSdkDir, relative_folder_path, folder_name)
    FileUtils.copy_entry(src_folder_entry_path, dst_folder_entry_path)
  end
end

def remove_unnecessary_files(relative_patterns)
  patterns = relative_patterns.map { |p| path_join(DstPicoSdkDir, p) }
  file_paths = Dir.glob(patterns)
  file_paths.each { |file_path| File.delete(file_path) }
end

def output_note_text
  note_text = '''copied required files from pico-sdk
https://github.com/raspberrypi/pico-sdk'''
  file_path = path_join(DstPicoSdkDir, 'note.txt')
  File.write(file_path, note_text)
end

def shell_exec(cmd)
  puts cmd
  system(cmd)
end

def pull_library_code
  if !Dir.exist?(SrcPicoSdkDir)
    shell_exec("git clone https://github.com/raspberrypi/pico-sdk #{SrcPicoSdkDir}")
    shell_exec("cd #{SrcPicoSdkDir} && git submodule update --init")
  else
    shell_exec("cd #{SrcPicoSdkDir} && git pull")
    shell_exec("cd #{SrcPicoSdkDir} && git submodule update")
  end

  puts('copy files ...')

  FileUtils.rm_rf(DstPicoSdkDir)

  copy_folder_recursive('src/rp2040')
  copy_folder_recursive('src/common')
  copy_folder_recursive('src/rp2_common')

  copy_source_files_direct_under('lib/tinyusb/src')
  copy_folder_recursive('lib/tinyusb/src/class/hid')
  copy_folder_recursive('lib/tinyusb/src/common')
  copy_folder_recursive('lib/tinyusb/src/device')
  copy_folder_recursive('lib/tinyusb/src/osal')
  copy_folder_recursive('lib/tinyusb/src/portable/raspberrypi')

  copy_single_file('LICENSE.TXT')
  output_note_text

  remove_unnecessary_files(['**/*.cmake', '**/CMakeLists.txt', '**/README.md', '**/*.svd', '**/*.py'])

  puts('copy files ...ok')
end

pull_library_code if __FILE__ == $0
