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
      if (value !== quantity) {
        onQuantity(quantity, ...proxiedArgs)
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
