const TOKEN_KEY = "token"

// The token has historically been written both as a raw string and as a
// JSON-stringified string, so reads have to tolerate either shape.
export const getStoredToken = () => {
  const raw = localStorage.getItem(TOKEN_KEY)

  if (!raw || raw === "undefined" || raw === "null") {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === "string" ? parsed : raw
  } catch {
    return raw
  }
}

export const setStoredToken = (token) => {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token))
}

export const removeStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}
