import pandas as pd
from bs4 import BeautifulSoup
import re
import pycountry
from unidecode import unidecode

def parse_region_countries():
    # 讀取 HTML 文件
    with open('data/region_countries.html', 'r', encoding='utf-8') as file:
        html_content = file.read()

    # 使用 BeautifulSoup 解析 HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # 找到所有的表格行
    rows = soup.find_all('tr')
    
    # 準備數據列表
    data = []
    
    # 遍歷每一行
    for row in rows[1:]:  # 跳過表頭行
        cols = row.find_all(['td', 'th'])
        if len(cols) >= 5:  # 確保行有足夠的列
            # 提取國家代碼
            code = cols[2].text.strip()
            
            # 提取國家中文名和國旗
            country_cell = cols[3]
            country_name_cn = country_cell.text.strip()
            
            # 提取國旗圖片URL
            flag_img = country_cell.find('img')
            flag_url = ''
            if flag_img:
                flag_url = flag_img.get('src', '')
                # 如果URL以//開頭，添加https:
                if flag_url.startswith('//'):
                    flag_url = 'https:' + flag_url
                # 獲取最大尺寸的圖片URL
                flag_url = get_largest_flag_url(flag_url)
            
            # 提取國家英文名
            country_name_en = cols[4].text.strip()
            if 'lang="en"' in str(cols[4]):
                country_name_en = cols[4].find('span', lang='en').text.strip()
            
            # 提取地理區域
            macro_region = cols[0].text.strip()
            sub_region = cols[1].text.strip()
            
            # 提取國家代碼（從國旗圖片URL中）
            abbrev = extract_country_code(flag_url) if flag_url else ''
            
            # 將數據添加到列表
            data.append({
                'id': code,
                'abbrev': get_iso_code(country_name_en),
                'name': country_name_en,
                'name_cn': country_name_cn,
                'macro_region': macro_region,
                'region': sub_region,
                'division': get_division(macro_region),
                'flag_url': flag_url
            })
    
    # 創建 DataFrame
    df = pd.DataFrame(data)
    
    # 清理數據
    df['id'] = df['id'].astype(str).str.zfill(3)  # 確保 id 是三位數的字符串
    
    return df

def get_largest_flag_url(url):
    """獲取最大尺寸的國旗圖片URL"""
    # 將22px替換為1200px以獲取更大尺寸的圖片
    return url.replace('22px', '1200px')

def extract_country_code(flag_url):
    """從國旗URL中提取國家代碼"""
    # 示例URL: //upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/22px-Flag_of_the_People%27s_Republic_of_China.svg.png
    match = re.search(r'Flag_of_(?:the_)?(.+?)\.svg', flag_url)
    if match:
        code = match.group(1)
        # 清理代碼
        code = code.replace('_', ' ')
        code = code.replace('%27s', '')
        code = code.replace('%28', '(').replace('%29', ')')
        return code
    return ''

def get_division(macro_region):
    """根據宏觀地理區域判斷部門分類"""
    if macro_region in ['亞洲']:
        return 'APAC'
    elif macro_region in ['歐洲', '非洲']:
        return 'EMEA'
    elif macro_region in ['美洲']:
        return 'AMER'
    else:
        return 'APAC'  # 大洋洲歸入 APAC

def get_iso_code(country_name):
    """使用 pycountry 獲取標準 ISO 3166-1 三位字母代碼"""
    # 特殊情況處理
    special_cases = {
        "Taiwan": "TWN",
        "Hong Kong": "HKG",
        "Macao": "MAC",
        "Korea": "KOR",
        "United States of America": "USA",
        "United Kingdom": "GBR",
        "Russian Federation": "RUS",
        # 添加其他特殊情況...
    }
    
    if country_name in special_cases:
        return special_cases[country_name]
    
    try:
        # 嘗試直接查找
        country = pycountry.countries.search_fuzzy(country_name)[0]
        print(f"{country_name} -> {country.alpha_3}")
        return country.alpha_3
    except LookupError:
        # 如果找不到，嘗試使用 unidecode 處理特殊字符
        try:
            normalized_name = unidecode(country_name)
            country = pycountry.countries.search_fuzzy(normalized_name)[0]
            return country.alpha_3
        except LookupError:
            print(f"無法找到國家代碼: {country_name}")
            return ""

def export_to_json(df):
    """將 DataFrame 轉換為所需的 JSON 格式"""
    # 準備 JSON 數據
    countries_json = {
        "countries": df.apply(lambda x: {
            "id": x['id'],
            "abbrev": x['abbrev'],
            "name": x['name'],
            "name_cn": x['name_cn'],
            "region": x['region'].upper().replace(' ', '_'),
            "division": x['division'],
            "flag_url": x['flag_url']
        }, axis=1).tolist()
    }
    
    # 將數據保存為 JSON 文件
    import json
    with open('data/countries1.json', 'w', encoding='utf-8') as f:
        json.dump(countries_json, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    # 解析數據
    df = parse_region_countries()
    
    # 顯示前幾行數據進行驗證
    print(df.head())
    
    # 導出為 JSON
    export_to_json(df) 