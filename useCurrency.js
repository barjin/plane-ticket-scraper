const currencyContext = {};

const updateCurrencyContext = async () => {
    currencyContext.currency = 'USD';

    const { rates } = await (await fetch('https://open.er-api.com/v6/latest/USD')).json();

    currencyContext.rates = rates;
    currencyContext.getRate = (amount, fromCurrency, toCurrency) => {
        return (amount / rates[fromCurrency]) * rates[toCurrency];
    }
}

const useCurrency = () => {
    return currencyContext;
}

module.exports = { updateCurrencyContext, useCurrency };