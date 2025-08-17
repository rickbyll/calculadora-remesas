document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const amountToSendEl = document.getElementById('amountToSend');
    const amountToReceiveEl = document.getElementById('amountToReceive');
    const cupResultEl = document.getElementById('cupResult');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const usdToCupRateInput = document.getElementById('usdToCupRate');
    const rate100Input = document.getElementById('rate100');
    const rate500Input = document.getElementById('rate500');
    const rate500PlusInput = document.getElementById('rate500Plus');

    // Nuevos botones de modo
    const sendModeBtn = document.getElementById('sendModeBtn');
    const receiveModeBtn = document.getElementById('receiveModeBtn');

    // Tarifas predeterminadas
    const defaultRates = {
        usdToCup: 400,
        rate100: 10,
        rate500: 5,
        rate500Plus: 3
    };

    let currentRates = { ...defaultRates };
    let currentMode = 'send'; // 'send' o 'receive'

    // Función para cargar la configuración guardada
    function loadSettings() {
        const savedRates = localStorage.getItem('zelleRates');
        if (savedRates) {
            currentRates = JSON.parse(savedRates);
        }
        usdToCupRateInput.value = currentRates.usdToCup;
        rate100Input.value = currentRates.rate100;
        rate500Input.value = currentRates.rate500;
        rate500PlusInput.value = currentRates.rate500Plus;
    }

    // Función para guardar la configuración
    function saveSettings() {
        currentRates = {
            usdToCup: parseFloat(usdToCupRateInput.value) || defaultRates.usdToCup,
            rate100: parseFloat(rate100Input.value) || defaultRates.rate100,
            rate500: parseFloat(rate500Input.value) || defaultRates.rate500,
            rate500Plus: parseFloat(rate500PlusInput.value) || defaultRates.rate500Plus
        };
        localStorage.setItem('zelleRates', JSON.stringify(currentRates));
        calculate(); // Recalcular con las nuevas tarifas
    }

    // Función para obtener la tarifa correcta basada en el monto A RECIBIR
    function getFeePercentage(amountToReceive) {
        if (amountToReceive < 100) {
            return currentRates.rate100 / 100;
        } else if (amountToReceive >= 100 && amountToReceive < 500) {
            return currentRates.rate500 / 100;
        } else { // Esto ahora cubre los montos de 500 o más
            return currentRates.rate500Plus / 100;
        }
    }

    // Función principal de cálculo
    function calculate() {
        if (currentMode === 'send') {
            const amountToSend = parseFloat(amountToSendEl.value);
            if (isNaN(amountToSend) || amountToSend <= 0) {
                amountToReceiveEl.value = '';
                cupResultEl.textContent = '0.00 CUP';
                return;
            }

            // Cálculo para "enviar"
            // Se calcula el monto a recibir para cada tarifa posible y se elige el correcto.
            let amountToReceive;
            
            // Caso 1: Se asume la tarifa del 3%
            let assumedReceive = amountToSend / (1 + currentRates.rate500Plus / 100);
            if (assumedReceive >= 500) {
                amountToReceive = assumedReceive;
            } 
            // Caso 2: Se asume la tarifa del 5%
            else if (amountToSend / (1 + currentRates.rate500 / 100) >= 100) {
                amountToReceive = amountToSend / (1 + currentRates.rate500 / 100);
            } 
            // Caso 3: Se asume la tarifa del 10%
            else {
                amountToReceive = amountToSend / (1 + currentRates.rate100 / 100);
            }

            amountToReceiveEl.value = amountToReceive.toFixed(2);
            cupResultEl.textContent = `${(amountToReceive * currentRates.usdToCup).toFixed(2)} CUP`;

        } else if (currentMode === 'receive') {
            const amountToReceive = parseFloat(amountToReceiveEl.value);
            if (isNaN(amountToReceive) || amountToReceive <= 0) {
                amountToSendEl.value = '';
                cupResultEl.textContent = '0.00 CUP';
                return;
            }
            // Cálculo para "recibir"
            const feePercentage = getFeePercentage(amountToReceive);
            const amountToSend = amountToReceive * (1 + feePercentage);
            amountToSendEl.value = amountToSend.toFixed(2);
            cupResultEl.textContent = `${(amountToReceive * currentRates.usdToCup).toFixed(2)} CUP`;
        }
    }

    // Función para cambiar el modo de entrada
    function setMode(mode) {
        currentMode = mode;
        if (mode === 'send') {
            amountToSendEl.disabled = false;
            amountToReceiveEl.disabled = true;
            amountToReceiveEl.value = '';
            amountToSendEl.value = '';
            sendModeBtn.classList.add('bg-blue-600', 'text-white');
            sendModeBtn.classList.remove('bg-gray-200', 'text-gray-700');
            receiveModeBtn.classList.remove('bg-blue-600', 'text-white');
            receiveModeBtn.classList.add('bg-gray-200', 'text-gray-700');
            amountToSendEl.focus();
        } else {
            amountToSendEl.disabled = true;
            amountToReceiveEl.disabled = false;
            amountToSendEl.value = '';
            amountToReceiveEl.value = '';
            receiveModeBtn.classList.add('bg-blue-600', 'text-white');
            receiveModeBtn.classList.remove('bg-gray-200', 'text-gray-700');
            sendModeBtn.classList.remove('bg-blue-600', 'text-white');
            sendModeBtn.classList.add('bg-gray-200', 'text-gray-700');
            amountToReceiveEl.focus();
        }
        cupResultEl.textContent = '0.00 CUP';
    }

    // Eventos para los campos de entrada
    amountToSendEl.addEventListener('input', calculate);
    amountToReceiveEl.addEventListener('input', calculate);

    // Eventos para los nuevos botones de modo
    sendModeBtn.addEventListener('click', () => setMode('send'));
    receiveModeBtn.addEventListener('click', () => setMode('receive'));

    // Eventos para el modal de configuración
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        settingsModal.classList.add('flex');
    });
    closeModalBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
        settingsModal.classList.remove('flex');
    });
    saveSettingsBtn.addEventListener('click', () => {
        saveSettings();
        settingsModal.classList.add('hidden');
        settingsModal.classList.remove('flex');
    });

    // Cargar la configuración y establecer el modo inicial
    loadSettings();
    setMode('send');
});
                             
