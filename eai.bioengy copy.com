# HTTPS server
server {
    listen 443 ssl;
    server_name eai.bioengy.com;

    # SSL 證書配置
    ssl_certificate /etc/nginx/ssl/bioengy/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/bioengy/private.pem;

    location / {
        proxy_pass http://[::1]:8082;
        proxy_set_header Host $host;
    }

    # 日誌配置
    access_log /var/log/nginx/eai.bioengy.access.log combined;
    error_log /var/log/nginx/eai.bioengy.error.log debug;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name eai.bioengy.com;
    return 301 https://$server_name$request_uri;
}
