<?php
// 安全防御：禁止直接通过 Web 访问或列出数据目录
http_response_code(403);
exit('403 Forbidden: Direct access to data directory is disallowed.');
