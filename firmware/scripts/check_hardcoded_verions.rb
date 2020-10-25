def read_software_common_versions
  text = File.read('../software/src/defs/Versions.ts')

  configStorageFormatRevision = text.match(/^export const ConfigStorageFormatRevision = (\d+);$/)[1].to_i
  rawHidMessageProtocolRevision = text.match(/^export const RawHidMessageProtocolRevision = (\d+);$/)[1].to_i

  {
    configStorageFormatRevision: configStorageFormatRevision,
    rawHidMessageProtocolRevision: rawHidMessageProtocolRevision
  }
end

def read_firmware_common_versions
  text = File.read('src/modules/versions.h')

  configStorageFormatRevision = text.match(/^#define CONFIG_STORAGE_FORMAT_REVISION (\d+)$/)[1].to_i
  rawHidMessageProtocolRevision = text.match(/^#define RAWHID_MESSAGE_PROTOCOL_REVISION (\d+)$/)[1].to_i
  {
    configStorageFormatRevision: configStorageFormatRevision,
    rawHidMessageProtocolRevision: rawHidMessageProtocolRevision
  }
end

if __FILE__ == $PROGRAM_NAME
  puts 'check version defintions ...'
  valid = read_software_common_versions == read_firmware_common_versions
  unless valid
    warn 'incompatibe version definitions'
    exit(1)
  end
  print "\e[A\e[K"
  puts 'check version defintions ... ok'
end
