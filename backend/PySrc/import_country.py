import json

# 讀取 JSON 文件
with open('data/countries.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# 生成 INSERT 語句
insert_statements = []
for country in data['countries']:
    insert_statement = f"""
    INSERT INTO country (id, abbrev, name, name_cn, region, continents, bu, division, flag, flag_url, bg_color) 
    VALUES ('{country['id']}', '{country['abbrev']}', '{country['name']}', '{country['name_cn']}', 
    '{country['region']}', '{country['continents']}', '{country['bu']}', '{country['division']}', 
    '{country['flag']}', '{country['flag_url']}', '{country['bg_color']}');
    """
    insert_statements.append(insert_statement)

# 將 INSERT 語句寫入文件
with open('insert_countries.sql', 'w', encoding='utf-8') as output_file:
    output_file.write('\n'.join(insert_statements))

print("INSERT 語句已生成到 insert_countries.sql")