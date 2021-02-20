const dateFormat = (date, datetime = false) => {
    const target = new Date(date),
        month = target.getMonth() + 1,
        finalMonth = month < 10 ? `0${month}` : month

    let = output = `${target.getFullYear()}-${finalMonth}-${target.getDate()}`

    if (datetime) {
        output += ` ${target.getHours()}:${target.getMinutes()}:${target.getSeconds()}`
    }

    return output
}

const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

$(async function () {
    const APIURL = 'https://covid19.mathdro.id/api',
        global = await axios.get(APIURL),
        indonesia = await axios.get(`${APIURL}/countries/IDN`),
        daily = await axios.get(`${APIURL}/daily`),
        countries = await axios.get(`${APIURL}/countries`)

    let globalDates = [],
        globalConfirmed = [],
        globalDeath = [],
        allCountries = []

    $("[data-content='global-lastupdate']").text(dateFormat(global.data.lastUpdate, true))
    $("[data-content='global-confirmed']").text(numberWithCommas(global.data.confirmed.value))
    $("[data-content='global-recovered']").text(numberWithCommas(global.data.recovered.value))
    $("[data-content='global-death']").text(numberWithCommas(global.data.deaths.value))

    $("[data-content='indonesia-lastupdate']").text(dateFormat(indonesia.data.lastUpdate, true))
    $("[data-content='indonesia-confirmed']").text(numberWithCommas(indonesia.data.confirmed.value))
    $("[data-content='indonesia-recovered']").text(numberWithCommas(indonesia.data.recovered.value))
    $("[data-content='indonesia-death']").text(numberWithCommas(indonesia.data.deaths.value))

    daily.data.forEach(value => {
        globalDates.push(value.reportDate)
        globalConfirmed.push(value.confirmed.total)
        globalDeath.push(value.deaths.total)
    })

    let globalChart = new Chart(document.getElementById('global-chart'), {
        type: 'line',
        data: {
            labels: globalDates,
            datasets: [{
                label: 'Terkonfirmasi',
                data: globalConfirmed,
                backgroundColor: 'rgba(253, 151, 68, 0.2)',
                borderColor: 'rgba(253, 151, 68, 1)',
                borderWidth: 1
            },
            {
                label: 'Meninggal',
                data: globalDeath,
                backgroundColor: 'rgba(252, 92, 101, 0.2)',
                borderColor: 'rgba(252, 92, 101, 1)',
                borderWidth: 1
            }]
        },
        options: {
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var value = data.datasets[0].data[tooltipItem.index];
                        value = value.toString();
                        value = value.split(/(?=(?:...)*$)/);
                        value = value.join('.');
                        return value;
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        autoSkip: true,
                        maxTicksLimit: 10,
                        userCallback: function (value, index, values) {
                            value = value.toString();
                            value = value.split(/(?=(?:...)*$)/);
                            value = value.join('.');
                            return value;
                        }
                    }
                }],
                xAxes: [{
                    type: 'time',
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 15
                    }
                }]
            }
        }
    })

    let loopAllCountries = new Promise((resolve, reject) => {
        countries.data.countries.forEach(async (value, index, array) => {
            let response = await axios.get(`${APIURL}/countries/${value.name}`)
            if (response.status == 200) {
                allCountries.push([
                    value.name,
                    numberWithCommas(response.data.confirmed.value),
                    numberWithCommas(response.data.recovered.value),
                    numberWithCommas(response.data.deaths.value)
                ])
            }
            console.clear()
            if (index == (array.length - 1)) resolve()
        })
    })

    loopAllCountries.then(() => {
        $("#country-table tbody").html("")
        $("#country-table").DataTable({
            data: allCountries
        })
    })
})