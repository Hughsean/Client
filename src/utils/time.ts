// 统一前端时间格式化：直接在时间上加 8 小时（UTC+8），不使用 Intl 的时区转换。
// 说明：后端若返回 UTC 时间或含时区的 ISO 字符串，直接将时间的 ms 值加上 8 小时即可得到北京时间表示。

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function formatToCN(input?: string | number | Date | null, withSeconds = false): string {
  if (!input) return '-'
  // 如果是字符串且不包含时区信息（既没有 Z，也没有 +hh:mm / -hh:mm），按 UTC 解析
  let src: string | number | Date | null | undefined = input
  if (typeof input === 'string') {
    const s = input.trim()
    // 匹配末尾有 Z 或 +HH 或 +HH:MM 或 -HH:MM 等时区标识
    const hasTZ = /Z$|[+\-]\d{2}(:?\d{2})?$/.test(s)
    if (!hasTZ) {
      // 把无时区的本地格式当作 UTC（在字符串后追加 Z）
      src = s + 'Z'
    } else {
      src = s
    }
  }

  const d = new Date(src as any)
  // console.log(d);
  if (isNaN(d.getTime())) return '-'
  // 直接在时间值上加 8 小时（毫秒）
  const beijing = new Date(d.getTime() + 8 * 60 * 60 * 1000)
  // console.log(beijing);

  // 使用 UTC 方法来读取被偏移后的年月日时分秒，避免本地时区再次影响
  const Y = beijing.getUTCFullYear()
  const M = pad2(beijing.getUTCMonth() + 1)
  const D = pad2(beijing.getUTCDate())
  const hh = pad2(beijing.getUTCHours())
  const mm = pad2(beijing.getUTCMinutes())
  const ss = pad2(beijing.getUTCSeconds())
  // console.log(`${Y}-${M}-${D} ${hh}:${mm}${withSeconds ? `:${ss}` : ''}`);

  return `${Y}-${M}-${D} ${hh}:${mm}${withSeconds ? `:${ss}` : ''}`
}
