import os

def fix_encoding():
    input_file = 'data_dump.json'
    output_file = 'data_dump_utf8.json'
    
    try:
        # PowerShell redirects often result in UTF-16 (LE) with BOM
        with open(input_file, 'r', encoding='utf-16') as f:
            content = f.read()
            
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"Successfully converted {input_file} to UTF-8 as {output_file}")
        
    except UnicodeError:
        # Fallback: maybe it was 'cp1252' or something else?
        print("UTF-16 failed, trying default encoding...")
        try:
             with open(input_file, 'r') as f: # default system encoding
                content = f.read()
             with open(output_file, 'w', encoding='utf-8') as f:
                f.write(content)
             print(f"Successfully converted {input_file} to UTF-8 (from default)")
        except Exception as e:
            print(f"Failed to convert: {e}")
    except Exception as e:
        print(f"General error: {e}")

if __name__ == "__main__":
    fix_encoding()
