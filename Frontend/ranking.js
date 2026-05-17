async function carregarRankings() {

    try {

        console.log("Carregando rankings...")

        const response = await fetch("http://127.0.0.1:10000/rankings")

        const data = await response.json()

        console.log(JSON.stringify(data, null, 2))

        const tbody = document.getElementById("ranking-body")

        tbody.innerHTML = ""

        data.rankings.forEach(team => {

            const tr = document.createElement("tr")

            tr.innerHTML = `
            
                <td>${team.rank}</td>
                <td>${team.team_key}</td>
                <td>${team.scout_score}</td>
                <td>${team.opr}</td>
                <td>${team.record.wins}</td>
                <td>${team.record.losses}</td>

            `

            tbody.appendChild(tr)
        })

    } catch (error) {

        console.error("ERRO:", error)

    }
}

carregarRankings()