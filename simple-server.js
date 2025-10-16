const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 8080;

// MIME типы для файлов
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json; charset=utf-8'
};

const server = http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname;
    
    console.log(`📥 Request: ${req.method} ${pathname}`);
    
    // Если запрошен корень, отдаем index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain; charset=utf-8';
    
    // Проверяем, существует ли файл
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`❌ File not found: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>404 - Страница не найдена</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 50px; 
                            background: #f5f5f5; 
                        }
                        .error { 
                            background: white; 
                            padding: 30px; 
                            border-radius: 10px; 
                            display: inline-block; 
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
                        }
                        a { color: #007bff; }
                    </style>
                </head>
                <body>
                    <div class="error">
                        <h1>404 - Страница не найдена</h1>
                        <p>Файл <code>${pathname}</code> не существует.</p>
                        <a href="/">🏠 Вернуться на главную</a>
                    </div>
                </body>
                </html>
            `);
            return;
        }
        
        // Читаем и отдаем файл
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(`❌ Error reading file: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="utf-8"><title>Ошибка сервера</title></head>
                    <body>
                        <h1>500 - Ошибка сервера</h1>
                        <p>Не удалось прочитать файл: ${err.message}</p>
                        <a href="/">Вернуться на главную</a>
                    </body>
                    </html>
                `);
            } else {
                console.log(`✅ Serving file: ${pathname} (${contentType})`);
                res.writeHead(200, { 
                    'Content-Type': contentType,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                });
                res.end(data);
            }
        });
    });
});

server.listen(port, '127.0.0.1', () => {
    console.log('');
    console.log('🚀 ====================================');
    console.log(`🌟 Сервер запущен успешно!`);
    console.log(`🌐 URL: http://localhost:${port}`);
    console.log(`📂 Папка: ${__dirname}`);
    console.log(`⏰ Время: ${new Date().toLocaleString('ru-RU')}`);
    console.log('🚀 ====================================');
    console.log('');
    console.log('📋 Доступные страницы:');
    console.log(`   • http://localhost:${port}/ - Главная страница`);
    console.log(`   • http://localhost:${port}/results.html - Результаты поиска`);
    console.log(`   • http://localhost:${port}/test.html - Тестовая страница`);
    console.log('');
    console.log('🔧 Для остановки сервера нажмите Ctrl+C');
    console.log('');
});

// Обработка ошибок
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Порт ${port} уже занят!`);
        console.log('💡 Попробуйте другой порт или остановите другой сервер');
    } else {
        console.log('❌ Ошибка сервера:', err.message);
    }
    process.exit(1);
});

// Обработка завершения процесса
process.on('SIGINT', () => {
    console.log('\n👋 Сервер остановлен');
    console.log('📊 Статистика: сервер проработал успешно!');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Сервер остановлен (SIGTERM)');
    process.exit(0);
});