// POST /api/auth  -> valida la contraseña del admin. Nunca expone process.env.ADMIN_PASSWORD al cliente.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  const { password } = req.body || {};

  if (!process.env.ADMIN_PASSWORD) {
    console.error('Falta configurar la variable de entorno ADMIN_PASSWORD en Vercel.');
    return res.status(500).json({ ok: false, error: 'Servidor sin configurar' });
  }

  if (password && password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false });
};
