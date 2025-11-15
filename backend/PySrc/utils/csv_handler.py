import csv
import os
from typing import List, Dict
from datetime import datetime

class CSVHandler:
    @staticmethod
    def ensure_file_exists(file_path: str, headers: List[str]):
        """確保 CSV 文件存在，如果不存在則創建"""
        if not os.path.exists(os.path.dirname(file_path)):
            os.makedirs(os.path.dirname(file_path))
            
        if not os.path.exists(file_path):
            with open(file_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(headers)

    @staticmethod
    def read_csv(file_path: str) -> List[Dict]:
        """讀取 CSV 文件"""
        if not os.path.exists(file_path):
            return []
            
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            return list(reader)

    @staticmethod
    def write_csv(file_path: str, data: Dict, headers: List[str]):
        """寫入 CSV 文件"""
        mode = 'a' if os.path.exists(file_path) else 'w'
        with open(file_path, mode, newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            if mode == 'w':
                writer.writeheader()
            writer.writerow(data) 

    @staticmethod
    def write_all_csv(file_path: str, data_list: List[Dict], columns: List[str]):
        """重寫整個 CSV 文件"""
        try:
            with open(file_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=columns)
                writer.writeheader()
                for data in data_list:
                    # 確保只寫入指定的列
                    row = {col: data.get(col, '') for col in columns}
                    writer.writerow(row)
            return True
        except Exception as e:
            print(f"Error writing to CSV: {e}")
            return False 

    @staticmethod
    def read_site_performance(file_path: str, site_id: str, year: str = None) -> List[Dict]:
        """讀取特定站點的性能數據，可以指定年份"""
        if not os.path.exists(file_path):
            return []
            
        if year is None:
            year = str(datetime.now().year)
            
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            data = []
            for row in reader:
                # 從 year_mon 中提取年份 (例如從 "Jan-24" 提取 "24")
                row_year = row['year_mon'].split('-')[1]
                # 將兩位數年份轉換為四位數 (例如 "24" -> "2024")
                full_year = "20" + row_year
                
                if row['id'] == site_id and full_year == year:
                    # 格式化月份顯示
                    month = row['year_mon'].split('-')[0]
                    row['year_mon'] = f"{month}"  # 只顯示月份
                    data.append(row)
                    
            return data 

    def write_csv_all(self, data, filename):
        """
        將所有數據寫入CSV文件
        :param data: 要寫入的數據列表
        :param filename: CSV文件名
        """
        try:
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = data[0].keys() if data else []
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(data)
            return True
        except Exception as e:
            print(f"Error writing CSV: {e}")
            return False 