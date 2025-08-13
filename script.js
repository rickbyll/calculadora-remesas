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

    // Tarifas predeterminadas
    const defaultRates = {
        usdToCup: 240,
        rate100: 10,
        rate500: 5,
        rate500Plus: 3
    };

    let currentRates = { ...defaultRates };

    // Función para cargar la configuración guardada
    function loadSettings() {
        const savedRates = localStorage.getItem('zelleRates');
        if (savedRates) {
            currentRates = JSON.parse(savedRates);
        }
        // Actualizar los inputs del modal con los valores cargados
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

    // Función para obtener la tarifa correcta
    function getFeePercentage(amount) {
        if (amount < 100) {
            return currentRates.rate100 / 100;
        } else if (amount >= 100 && amount <= 500) {
            return currentRates.rate500 / 100;
        } else {
            return currentRates.rate500Plus / 100;
        }
    }

    // Función principal de cálculo
    function calculate() {
        // Calcular basado en "Dinero a enviar"
        if (amountToSendEl.value) {
            const amountToSend = parseFloat(amountToSendEl.value);
            if (isNaN(amountToSend) || amountToSend <= 0) {
                amountToReceiveEl.value = '';
                cupResultEl.textContent = '0.00 CUP';
                return;
            }

            // Para calcular de "enviar" a "recibir", necesitamos una fórmula inversa o iterativa.
            // Una manera sencilla es adivinar un valor y ajustarlo.
            let amountToReceive = amountToSend / (1 + getFeePercentage(amountToSend));

            // Refinamiento iterativo para encontrar el valor exacto
            for(let i = 0; i < 10; i++) {
                const feePercentage = getFeePercentage(amountToReceive);
                amountToReceive = amountToSend / (1 + feePercentage);
            }

            amountToReceiveEl.value = amountToReceive.toFixed(2);
            cupResultEl.textContent = `${(amountToReceive * currentRates.usdToCup).toFixed(2)} CUP`;

        } 
        // Calcular basado en "Dinero a recibir"
        else if (amountToReceiveEl.value) {
            const amountToReceive = parseFloat(amountToReceiveEl.value);
            if (isNaN(amountToReceive) || amountToReceive <= 0) {
                amountToSendEl.value = '';
                cupResultEl.textContent = '0.00 CUP';
                return;
            }
            const feePercentage = getFeePercentage(amountToReceive);
            const amountToSend = amountToReceive + (feePercentage * amountToReceive);
            amountToSendEl.value = amountToSend.toFixed(2);
            cupResultEl.textContent = `${(amountToReceive * currentRates.usdToCup).toFixed(2)} CUP`;
        } else {
            amountToSendEl.value = '';
            amountToReceiveEl.value = '';
            cupResultEl.textContent = '0.00 CUP';
        }
    }

    // Eventos para los campos de entrada
    amountToSendEl.addEventListener('input', () => {
        amountToReceiveEl.disabled = true;
        calculate();
        if (amountToSendEl.value === '') {
            amountToReceiveEl.disabled = false;
        }
    });

    amountToReceiveEl.addEventListener('input', () => {
        amountToSendEl.disabled = true;
        calculate();
        if (amountToReceiveEl.value === '') {
            amountToSendEl.disabled = false;
        }
    });

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
    
    // Cargar la configuración y realizar el cálculo inicial
    loadSettings();
    calculate();
});
          
