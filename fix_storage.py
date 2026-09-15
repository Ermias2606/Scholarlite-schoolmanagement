with open('src/utils/storage.ts', 'r') as f:
    content = f.read()

content = content.replace("    return false;\n  }\n}\n}\n", "    return false;\n  }\n}\n")

with open('src/utils/storage.ts', 'w') as f:
    f.write(content)
