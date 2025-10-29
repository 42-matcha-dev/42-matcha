import { Router } from 'express';
import supabase from '../database/supabase.init.js';
const router = Router();


router.post('/upload-urls', async (req, res) => {
	try {
	  const { fileNames } = req.body
	  if (!fileNames || !Array.isArray(fileNames)) {
		return res.status(400).json({ error: 'Invalid fileNames array' })
	  }

	  const urls = []
	  for (const name of fileNames) {
		const { data, error } = await supabase.storage
		  .from('user-photos')
		  .createSignedUploadUrl(`users/${Date.now()}_${name}`)
		if (error) return res.status(500).json({ error: error.message })
		urls.push(data)
	  }

	  res.json({ urls })
	} catch (err: any) {
	  console.error(err)
	  res.status(500).json({ error: 'Server error creating signed URLs' })
	}
  })

export default router;
