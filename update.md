```bash
cd /home/sanamo/Websites/KarterSanamo || exit 1; ./stop-contact-server.sh 2>/dev/null; docker stop kartersanamo-site 2>/dev/null; docker rm -f kartersanamo-site 2>/dev/null; docker rmi -f kartersanamo-site 2>/dev/null; docker build -t kartersanamo-site . && docker run -d --name kartersanamo-site -p 8001:80 -v /home/sanamo/Websites/KarterSanamo/messages:/var/lib/contact-messages --restart unless-stopped kartersanamo-site && ./start-contact-server.sh
```
