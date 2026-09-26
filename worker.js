export default {
  async fetch(request, env, ctx) {
    const html = `<!DOCTYPE html>
<html lang="zh-HK">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>香港巴士開放數據提取工具 (DATA.GOV.HK)</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- FontAwesome 圖標 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50 text-gray-800 font-sans min-h-screen">

    <!-- 頂部標題列 -->
    <header class="bg-blue-600 text-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center space-x-3">
                <i class="fa-solid font-bold text-2xl fa-bus-simple text-yellow-300"></i>
                <h1 class="text-xl font-bold tracking-wide">香港巴士開放數據 API 提取工具</h1>
            </div>
            <div class="text-sm bg-blue-700 px-3 py-1 rounded-full border border-blue-400">
                <span class="inline-block w-2 h-2 rounded-full bg-green-400 mr-1 animate-pulse"></span>
                DATA.GOV.HK 直連
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- 左側：參數選擇器 -->
        <section class="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div class="space-y-4">
                <h2 class="text-lg font-semibold border-b pb-2 flex items-center">
                    <i class="fa-solid fa-sliders text-blue-600 mr-2"></i> 數據提取設定
                </h2>

                <!-- 專案/巴士公司 -->
                <div>
                    <label class="block text-xs font-semibold uppercase text-gray-500 mb-1">巴士公司 (Company)</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button type="button" onclick="setCompany('kmb')" id="btn-kmb" class="company-btn active py-2 rounded-lg font-medium border text-sm transition-colors bg-red-600 text-white border-red-600">
                            九巴 (KMB)
                        </button>
                        <button type="button" onclick="setCompany('ctb')" id="btn-ctb" class="company-btn py-2 rounded-lg font-medium border text-sm transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200">
                            城巴 (Citybus)
                        </button>
                    </div>
                </div>

                <!-- 數據集類型 (依公司動態渲染) -->
                <div>
                    <label class="block text-xs font-semibold uppercase text-gray-500 mb-1">選擇數據集 (Dataset)</label>
                    <select id="apiType" onchange="updateFormInputs()" class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <!-- JS 動態插入 -->
                    </select>
                </div>

                <!-- 動態輸入欄位 -->
                <div id="dynamicInputs" class="space-y-3 pt-2">
                    <!-- JS 動態插入 -->
                </div>

                <!-- 自動併入中文站名開關 -->
                <div class="pt-2 border-t border-gray-100">
                    <label class="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" id="autoMergeStopName" checked class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300">
                        <span class="font-medium">自動對照/併入巴士站中文名稱</span>
                    </label>
                    <p class="text-xs text-gray-400 mt-1 pl-6">關聯數據或 ETA 僅有 Station ID 時，自動補全中文與英文站名。</p>
                </div>
            </div>

            <div class="pt-6">
                <button onclick="fetchData()" id="fetchBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow transition flex justify-center items-center space-x-2">
                    <i class="fa-solid fa-cloud-arrow-down"></i>
                    <span>提取 JSON 數據</span>
                </button>
            </div>
        </section>

        <!-- 右側：數據結果與展示 -->
        <section class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[700px]">
            <!-- 數據操作與狀態標籤 -->
            <div class="flex flex-wrap justify-between items-center border-b pb-3 gap-2">
                <div class="flex items-center space-x-2">
                    <h2 class="text-lg font-semibold flex items-center">
                        <i class="fa-solid fa-code text-blue-600 mr-2"></i> JSON 回傳結果
                    </h2>
                    <span id="statusBadge" class="hidden text-xs px-2.5 py-1 rounded-full font-medium"></span>
                </div>

                <div class="flex items-center space-x-2">
                    <button onclick="copyToClipboard()" class="text-xs border px-3 py-1.5 rounded-md hover:bg-gray-50 text-gray-700 transition">
                        <i class="fa-regular fa-copy mr-1"></i> 複製
                    </button>
                    <button onclick="downloadJSON()" class="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-md hover:bg-gray-900 transition">
                        <i class="fa-solid fa-download mr-1"></i> 下載 JSON
                    </button>
                </div>
            </div>

            <!-- 網址預覽 -->
            <div class="my-3 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-dashed border-gray-300 font-mono overflow-x-auto truncate">
                <span class="font-bold text-gray-700">API URL:</span> <span id="apiUrlDisplay">請點擊上方按鈕開始提取...</span>
            </div>

            <!-- JSON 文字視窗 -->
            <div class="flex-1 bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto font-mono text-xs shadow-inner relative">
                <pre id="jsonOutput" class="whitespace-pre-wrap break-all">// 數據將會在此顯示...</pre>
            </div>
        </section>

    </main>

    <script>
        let currentCompany = 'kmb';
        const stopNameCache = new Map();

        // 兩大公司獨立數據集配置
        const datasetConfig = {
            kmb: [
                { val: 'route_list', text: '路線列表數據 (Route List)' },
                { val: 'route_detail', text: '路線詳情數據 (Route Detail)' },
                { val: 'stop_list', text: '巴士站列表 / 詳情數據 (Bus Stop)' },
                { val: 'route_stop', text: '路線-巴士站關聯數據 (Route-Stop)' },
                { val: 'eta_stop', text: '預計到達時間 - 按巴士站 (ETA by Stop)' },
                { val: 'eta_route', text: '預計到達時間 - 按路線 (ETA by Route)' }
            ],
            ctb: [
                { val: 'company_data', text: '公司數據 (Company Data)' },
                { val: 'route_list', text: '路線列表數據 (Route List)' },
                { val: 'route_detail', text: '路線數據 (Route Detail)' },
                { val: 'stop_list', text: '巴士站數據 (Bus Stop)' },
                { val: 'route_stop', text: '個別路線的巴士站數據 (Route-Stop)' },
                { val: 'eta_stop', text: '預計到達時間數據 (ETA)' }
            ]
        };

        // 切換巴士公司
        function setCompany(company) {
            currentCompany = company;
            const btnKmb = document.getElementById('btn-kmb');
            const btnCtb = document.getElementById('btn-ctb');

            if (company === 'kmb') {
                btnKmb.className = "company-btn active py-2 rounded-lg font-medium border text-sm transition-colors bg-red-600 text-white border-red-600";
                btnCtb.className = "company-btn py-2 rounded-lg font-medium border text-sm transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200";
            } else {
                btnCtb.className = "company-btn active py-2 rounded-lg font-medium border text-sm transition-colors bg-yellow-500 text-white border-yellow-500";
                btnKmb.className = "company-btn py-2 rounded-lg font-medium border text-sm transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200";
            }
            
            updateApiDropdown();
        }

        // 動態生成下拉選單
        function updateApiDropdown() {
            const select = document.getElementById('apiType');
            select.innerHTML = '';
            
            const options = datasetConfig[currentCompany] || [];
            options.forEach(opt => {
                const el = document.createElement('option');
                el.value = opt.val;
                el.textContent = opt.text;
                select.appendChild(el);
            });

            updateFormInputs();
        }

        // 依據 API 種類動態渲染輸入框
        function updateFormInputs() {
            const apiType = document.getElementById('apiType').value;
            const container = document.getElementById('dynamicInputs');
            container.innerHTML = '';

            if (currentCompany === 'kmb') {
                if (apiType === 'route_detail') {
                    container.innerHTML += createInput('route', '路線號碼 (Route)', '例如: 1A, 107, B1');
                    container.innerHTML += createSelect('direction', '方向 (Direction)', [
                        {val: 'outbound', text: '去程 (Outbound)'},
                        {val: 'inbound', text: '回程 (Inbound)'}
                    ]);
                    container.innerHTML += createInput('service_type', '服務類型 (Service Type)', '通常為 1', '1');
                } else if (apiType === 'stop_list') {
                    container.innerHTML += createInput('stop_id', '巴士站 ID (Stop ID)', '例如: B71E86A8D0039DC7 (留空查詢全部)');
                } else if (apiType === 'route_stop') {
                    container.innerHTML += createInput('route', '路線號碼 (Route)', '例如: 1A');
                    container.innerHTML += createSelect('direction', '方向 (Direction)', [
                        {val: 'outbound', text: '去程 (Outbound)'},
                        {val: 'inbound', text: '回程 (Inbound)'}
                    ]);
                    container.innerHTML += createInput('service_type', '服務類型 (Service Type)', '通常為 1', '1');
                } else if (apiType === 'eta_stop') {
                    container.innerHTML += createInput('stop_id', '巴士站 ID (Stop ID)', '例如: B71E86A8D0039DC7');
                } else if (apiType === 'eta_route') {
                    container.innerHTML += createInput('route', '路線號碼 (Route)', '例如: 1A');
                    container.innerHTML += createInput('service_type', '服務類型 (Service Type)', '通常為 1', '1');
                }
            } else {
                // 城巴 (Citybus)
                if (apiType === 'company_data') {
                    // 公司數據無須額外參數
                } else if (apiType === 'route_detail') {
                    container.innerHTML += createInput('route', '路線號碼 (Route)', '例如: A23, 102');
                } else if (apiType === 'stop_list') {
                    container.innerHTML += createInput('stop_id', '巴士站 ID (Stop ID)', '例如: 001757');
                } else if (apiType === 'route_stop') {
                    container.innerHTML += createInput('route', '路線號碼 (Route)', '例如: A23, 102');
                    container.innerHTML += createSelect('direction', '方向 (Direction)', [
                        {val: 'outbound', text: '去程 (Outbound)'},
                        {val: 'inbound', text: '回程 (Inbound)'}
                    ]);
                } else if (apiType === 'eta_stop') {
                    container.innerHTML += createInput('stop_id', '巴士站 ID (Stop ID)', '例如: 001757');
                    container.innerHTML += createInput('route', '路線號碼 (Route)', '例如: A23');
                }
            }
        }

        function createInput(id, label, placeholder, defaultValue = '') {
            return \`
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">\${label}</label>
                    <input type="text" id="input_\${id}" value="\${defaultValue}" placeholder="\${placeholder}" class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                </div>
            \`;
        }

        function createSelect(id, label, options) {
            const opts = options.map(o => \`<option value="\${o.val}">\${o.text}</option>\`).join('');
            return \`
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">\${label}</label>
                    <select id="input_\${id}" class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        \${opts}
                    </select>
                </div>
            \`;
        }

        // 構建 API URL
        function buildApiUrl() {
            const apiType = document.getElementById('apiType').value;
            const getVal = (id) => document.getElementById(\`input_\${id}\`)?.value.trim() || '';

            if (currentCompany === 'kmb') {
                const baseUrl = 'https://data.etabus.gov.hk/v1/transport/kmb';
                switch (apiType) {
                    case 'route_list': return \`\${baseUrl}/route/\`;
                    case 'route_detail': 
                        return \`\${baseUrl}/route/\${getVal('route')}/\${getVal('direction')}/\${getVal('service_type') || '1'}\`;
                    case 'stop_list': 
                        return getVal('stop_id') ? \`\${baseUrl}/stop/\${getVal('stop_id')}\` : \`\${baseUrl}/stop\`;
                    case 'route_stop': 
                        return getVal('route') ? \`\${baseUrl}/route-stop/\${getVal('route')}/\${getVal('direction')}/\${getVal('service_type') || '1'}\` : \`\${baseUrl}/route-stop\`;
                    case 'eta_stop': 
                        return \`\${baseUrl}/stop-eta/\${getVal('stop_id')}\`;
                    case 'eta_route': 
                        return \`\${baseUrl}/route-eta/\${getVal('route')}/\${getVal('service_type') || '1'}\`;
                }
            } else {
                // 城巴 (Citybus)
                const baseUrlV1 = 'https://rt.data.gov.hk/v1/transport/citybus-nwfb';
                const baseUrlV2 = 'https://rt.data.gov.hk/v2/transport/citybus';
                switch (apiType) {
                    case 'company_data': 
                        return \`\${baseUrlV1}/company/CTB\`;
                    case 'route_list': 
                        return \`\${baseUrlV2}/route/ctb\`;
                    case 'route_detail': 
                        return \`\${baseUrlV2}/route/ctb/\${getVal('route') || 'A23'}\`;
                    case 'stop_list': 
                        return \`\${baseUrlV2}/stop/\${getVal('stop_id') || '001757'}\`;
                    case 'route_stop': 
                        return \`\${baseUrlV2}/route-stop/ctb/\${getVal('route') || 'A23'}/\${getVal('direction') || 'outbound'}\`;
                    case 'eta_stop': 
                        return \`\${baseUrlV2}/eta/ctb/\${getVal('stop_id') || '001757'}/\${getVal('route') || 'A23'}\`;
                }
            }
        }

        // 查詢單個巴士站名稱資訊
        async function fetchStopInfo(stopId) {
            const cacheKey = \`\${currentCompany}_\${stopId}\`;
            if (stopNameCache.has(cacheKey)) {
                return stopNameCache.get(cacheKey);
            }

            try {
                const url = currentCompany === 'kmb'
                    ? \`https://data.etabus.gov.hk/v1/transport/kmb/stop/\${stopId}\`
                    : \`https://rt.data.gov.hk/v2/transport/citybus/stop/\${stopId}\`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.data) {
                        const info = {
                            name_tc: data.data.name_tc || '',
                            name_en: data.data.name_en || ''
                        };
                        stopNameCache.set(cacheKey, info);
                        return info;
                    }
                }
            } catch (e) {
                console.error('Fetch stop failed', e);
            }
            return { name_tc: '未知巴士站', name_en: 'Unknown Stop' };
        }

        // 執行數據請求
        async function fetchData() {
            const url = buildApiUrl();
            const urlDisplay = document.getElementById('apiUrlDisplay');
            const jsonOutput = document.getElementById('jsonOutput');
            const statusBadge = document.getElementById('statusBadge');
            const autoMerge = document.getElementById('autoMergeStopName').checked;

            urlDisplay.innerText = url;
            jsonOutput.innerText = '// 正在載入數據，請稍候...';
            statusBadge.className = "text-xs px-2.5 py-1 rounded-full font-medium bg-yellow-100 text-yellow-800";
            statusBadge.innerText = '載入中...';
            statusBadge.classList.remove('hidden');

            try {
                const startTime = performance.now();
                const response = await fetch(url);
                const endTime = performance.now();
                const duration = Math.round(endTime - startTime);

                if (!response.ok) throw new Error(\`HTTP Error Status: \${response.status}\`);

                const data = await response.json();

                // 若勾選自動對照，且資料含 stop 欄位
                if (autoMerge && Array.isArray(data.data)) {
                    const stopIds = [...new Set(data.data.map(item => item.stop).filter(Boolean))];
                    if (stopIds.length > 0) {
                        statusBadge.innerText = \`載入中... (正在對照 \${stopIds.length} 個站名)\`;
                        
                        // 並行對照所有站點名稱
                        const stopMap = {};
                        await Promise.all(stopIds.map(async id => {
                            stopMap[id] = await fetchStopInfo(id);
                        }));

                        // 將 name_tc 和 name_en 注入 JSON 數據項目中
                        data.data = data.data.map(item => {
                            if (item.stop && stopMap[item.stop]) {
                                return {
                                    ...item,
                                    name_tc: stopMap[item.stop].name_tc,
                                    name_en: stopMap[item.stop].name_en
                                };
                            }
                            return item;
                        });
                    }
                }

                jsonOutput.innerText = JSON.stringify(data, null, 2);

                const count = Array.isArray(data.data) ? data.data.length : (data.data ? 1 : 0);
                statusBadge.className = "text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-800";
                statusBadge.innerText = \`200 OK (\${duration}ms) - 共 \${count} 筆紀錄\${autoMerge ? ' (已對照中文站名)' : ''}\`;

            } catch (err) {
                jsonOutput.innerText = \`// 提取數據失敗:\\n\${err.message}\`;
                statusBadge.className = "text-xs px-2.5 py-1 rounded-full font-medium bg-red-100 text-red-800";
                statusBadge.innerText = '請求失敗';
            }
        }

        // 複製到剪貼簿
        function copyToClipboard() {
            const text = document.getElementById('jsonOutput').innerText;
            navigator.clipboard.writeText(text).then(() => {
                alert('JSON 數據已成功複製到剪貼簿！');
            });
        }

        // 下載 JSON
        function downloadJSON() {
            const text = document.getElementById('jsonOutput').innerText;
            const blob = new Blob([text], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`bus_data_\${new Date().toISOString().slice(0,10)}.json\`;
            a.click();
            URL.revokeObjectURL(url);
        }

        // 初始化
        updateApiDropdown();
    </script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }
};