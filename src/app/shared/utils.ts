import { Restaurant } from './graphql'

export function inputNumberFixer(
  onQuantity: (qty: number, ...proxiedArgs: any[]) => void,
  min: number = -Infinity,
  max: number = Infinity,
  maxDecimals: number = Infinity
) {
  return {
    keyup({target}, ...proxiedArgs: any[]) {
      if (!target.value) {
        return
      }
      const value = Number.parseFloat(target.value)
      const decimals = target.value.replace(/^[0-9]+(?:[.,]([0-9]+))?$/, '$1').length
      const vMax = Number.parseFloat(target.max) || max
      const vMin = Number.parseFloat(target.min) || min
      const quantity = +(Math.max(Math.min(value, vMax), vMin) || 0).toFixed(Math.min(decimals, maxDecimals))
      onQuantity(quantity, ...proxiedArgs)
      if (value !== quantity) {
        target.value = quantity
      }
    },
    keypress(event) {
      if (['e', '-', '+'].includes(event.key)) {
        event.preventDefault()
      }
    }
  }
}

export async function shareRestaurant(restaurant: Restaurant) {
  const {id, name, menu: {price}} = restaurant
  const data = {
    title: `Menú de ${name}`,
    text: `🍽️ Te envío el menú del día de ${name}, el precio es de ${price.toFixed(2)}€!\n👌 Disfrútalo\n`,
    url: `${document.location.origin}/${id}`,
  }
  // @ts-ignore
  if (!!navigator.share) {
    // @ts-ignore
    await navigator.share(data)
  } else {
    try {
      // @ts-ignore
      await navigator.clipboard.writeText(data.text + data.url)
    } catch {
      console.warn('No Share and Clipboard API!')
    }
  }
}
