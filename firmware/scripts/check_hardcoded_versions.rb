def read_software_common_versions
  text = File.read('../software/src/defs/Versions.ts')

  config_storage_format_revision = text.match(/^export const ConfigStorageFormatRevision = (\d+);$/)[1].to_i
  rawhid_message_protocol_revision = text.match(/^export const RawHidMessageProtocolRevision = (\d+);$/)[1].to_i

  {
    config_storage_format_revision: config_storage_format_revision,
    rawhid_message_protocol_revision: rawhid_message_protocol_revision
  }
end

def read_firmware_common_versions
  text = File.read('src/modules/versions.h')

  config_storage_format_revision = text.match(/^#define CONFIG_STORAGE_FORMAT_REVISION (\d+)$/)[1].to_i
  rawhid_message_protocol_revision = text.match(/^#define RAWHID_MESSAGE_PROTOCOL_REVISION (\d+)$/)[1].to_i
  {
    config_storage_format_revision: config_storage_format_revision,
    rawhid_message_protocol_revision: rawhid_message_protocol_revision
  }
end

if __FILE__ == $PROGRAM_NAME
  puts 'check version defintions ...'
  v_soft = read_software_common_versions
  v_firm = read_firmware_common_versions
  valid = v_soft == v_firm
  unless valid
    warn 'incompatibe version definitions'
    puts 'software:', v_soft
    puts 'firmware:', v_firm
    exit(1)
  end
  print "\e[A\e[K"
  puts 'check version defintions ... ok'
end
