$(document).ready(function() {
    let apostaCount = 1;

    $('#adicionarAposta').click(function() {
        apostaCount++;
        $('#apostas-container').append(`
            <div class="aposta">
                <h3>Aposta ${apostaCount}</h3>
                <div class="form-group">
                    <label for="oddsFavorito-${apostaCount}">Odds do Favorito:</label>
                    <input type="number" step="0.01" id="oddsFavorito-${apostaCount}" class="oddsFavorito" placeholder="Insira as odds do favorito">
                </div>
                <div class="form-group">
                    <label for="oddsAzarão-${apostaCount}">Odds do Azarão:</label>
                    <input type="number" step="0.01" id="oddsAzarão-${apostaCount}" class="oddsAzarão" placeholder="Insira as odds do azarão">
                </div>
            </div>
        `);
    });

    $('#calcularAposta').click(function() {
        let saldo = parseFloat($('#saldo').val());
        let percentualMinimo = parseFloat($('#percentualMinimo').val());
        let margemSeguranca = 0.10;  // Margem de segurança de 10%
        
        if (isNaN(saldo) || saldo <= 0) {
            alert("Por favor, insira um saldo válido.");
            return;
        }

        if (isNaN(percentualMinimo) || percentualMinimo < 0 || percentualMinimo > 100) {
            alert("Por favor, insira uma porcentagem mínima válida entre 0 e 100.");
            return;
        }

        let apostas = [];
        let totalProbabilidades = 0;

        $('.aposta').each(function(index, element) {
            let oddsFavorito = parseFloat($(element).find('.oddsFavorito').val());
            let oddsAzarão = parseFloat($(element).find('.oddsAzarão').val());
            
            if (isNaN(oddsFavorito) || isNaN(oddsAzarão) || oddsFavorito <= 0 || oddsAzarão <= 0) {
                alert("Por favor, insira odds válidas para todas as apostas.");
                return false; // break the each loop
            }

            // Calcular as probabilidades com base nas odds
            let probabilidadeFavorito = 1 / oddsFavorito;
            let probabilidadeAzarão = 1 / oddsAzarão;

            // Normalizar as probabilidades para que a soma seja 1
            let somaProbabilidades = probabilidadeFavorito + probabilidadeAzarão;
            probabilidadeFavorito /= somaProbabilidades;
            probabilidadeAzarão /= somaProbabilidades;

            totalProbabilidades += probabilidadeFavorito + probabilidadeAzarão;

            apostas.push({
                probabilidadeFavorito: probabilidadeFavorito,
                probabilidadeAzarão: probabilidadeAzarão,
                oddsFavorito: oddsFavorito,
                oddsAzarão: oddsAzarão
            });
        });

        if (totalProbabilidades === 0) {
            $('#resultado').html("<p>Por favor, insira odds válidas para todas as apostas.</p>");
            return;
        }

        // Distribuir o saldo total proporcionalmente às probabilidades de cada aposta
        let resultadoHTML = "";
        let saldoRestante = saldo * (1 - margemSeguranca);
        let totalPeso = apostas.reduce((acc, aposta) => acc + aposta.probabilidadeFavorito + aposta.probabilidadeAzarão, 0);
        let totalValorApostado = 0;
        let probabilidadeGanhar = 1;

        apostas.forEach((aposta, index) => {
            let pesoFavorito = aposta.probabilidadeFavorito / totalPeso;
            let pesoAzarão = aposta.probabilidadeAzarão / totalPeso;

            let valorApostaFavorito = saldoRestante * pesoFavorito;
            let valorApostaAzarão = saldoRestante * pesoAzarão;

            // Verificar a porcentagem mínima para escolher o Azarão
            let porcentagemAzarão = (aposta.probabilidadeAzarão * 100).toFixed(2);
            let timeEscolhido = (porcentagemAzarão >= percentualMinimo) ? "Azarão" : (valorApostaFavorito > valorApostaAzarão) ? "Favorito" : "Azarão";
            let valorAposta = (timeEscolhido === "Favorito") ? valorApostaFavorito : valorApostaAzarão;

            totalValorApostado += valorAposta;

            // Probabilidade de não ganhar a aposta (perder)
            let probabilidadePerder = (timeEscolhido === "Favorito") ? (1 - aposta.probabilidadeFavorito) : (1 - aposta.probabilidadeAzarão);
            // Multiplica a probabilidade de perder para todas as apostas
            probabilidadeGanhar *= probabilidadePerder;

            resultadoHTML += `
                <div class="resultado-aposta">
                    <h4>Aposta ${index + 1}</h4>
                    <p>Probabilidade de Vitória do Favorito: <strong>${(aposta.probabilidadeFavorito * 100).toFixed(2)}%</strong></p>
                    <p>Probabilidade de Vitória do Azarão: <strong>${(aposta.probabilidadeAzarão * 100).toFixed(2)}%</strong></p>
                    <p>Porcentagem do Azarão: <strong>${porcentagemAzarão}%</strong></p>
                    <p>Time escolhido: <strong>${timeEscolhido}</strong></p>
                    <p>Valor sugerido para apostar: <strong>R$ ${valorAposta.toFixed(2)}</strong></p>
                </div>
            `;
        });

        // Calcula a probabilidade de ganhar pelo menos uma aposta
        probabilidadeGanhar = 1 - probabilidadeGanhar;

        resultadoHTML += `
            <div class="resultado-total">
                <h4>Total Apostado: R$ ${totalValorApostado.toFixed(2)}</h4>
                <p>Probabilidade de ganhar alguma aposta: <strong>${(probabilidadeGanhar * 100).toFixed(2)}%</strong></p>
            </div>
        `;

        $('#resultado').html(resultadoHTML);
    });
});
