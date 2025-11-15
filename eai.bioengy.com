# 主要服務器配置
server {
    listen 80;
    server_name eai.bioengy.com 125.229.37.248;

    # 調試信息
    add_header X-Debug-Message "Nginx is working" always;
    add_header X-Forwarded-Host $host always;
    add_header X-Real-IP $remote_addr always;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;

        # 錯誤處理
        proxy_intercept_errors on;
        error_page 502 504 /50x.html;

        # 添加 CORS 支持
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;

        # 預檢請求處理
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # 錯誤頁面
    location = /50x.html {
        root /usr/share/nginx/html;
        internal;
    }

    access_log /var/log/nginx/eai.bioengy.access.log combined;
    error_log /var/log/nginx/eai.bioengy.error.log debug;
}
