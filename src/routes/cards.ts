import Formidable, { Fields } from 'formidable';
import { Router } from 'express';
import { StatusCodes } from '../common';
import { getFileName, getFileExt } from '../common/utils';
import {
  createCard,
  deleteCard,
  getCardByWord,
  getAllCards,
  getCardsByCategoryId,
  // updateCard,

} from '../storage/fs';
// from '../storage/repository';
import { Card } from '../common/interfaces';

// import { getCategoryById } from '../category/repository';

const router = Router();

// const pictsPath = path.resolve(__dirname, '../../public/media/img');
// const soundsPath = path.resolve(__dirname, '../../public/media/audio');
const PUBLIC_SOUND_PATH = 'https://efk-srv.herokuapp.com/media/audio/';
const PUBLIC_PICTURE_PATH = 'https://efk-srv.herokuapp.com/media/img/';

router.get('/', async (req, res) => {
  try {
    const data = await getAllCards();
    return res.json(data);
  } catch (error) {
    return res.status(StatusCodes.BadRequest).send(error.message);
  }
});

router.get('/category/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id && id !== 0) return res.sendStatus(StatusCodes.NotFound);
    const data = await getCardsByCategoryId(id);
    if (!data) return res.sendStatus(StatusCodes.NotFound);
    return res.json(data);
  } catch (e) {
    return res.status(StatusCodes.BadRequest).send(e);
  }
});

router.get('/:name', async (req, res) => {
  try {
    const data = await getCardByWord(req.params.name);
    if (!data) return res.sendStatus(StatusCodes.NotFound);
    return res.json(data);
  } catch (e) {
    return res.status(StatusCodes.BadRequest).send(e);
  }
});

router.delete('/:name', async (req, res) => {
  const delWord = req.params.name;
  try {
    const data = await deleteCard(delWord);
    return res.json(data);
  } catch (e) {
    return res.status(StatusCodes.BadRequest).send(e.message);
  }
});

router.post('/', async (req, res) => {
  const formData = Formidable({ multiples: true });
  const newCard: Card = {
    word: '',
    translation: '',
    image: '',
    audio: '',
    categoryId: -1,
  };
  let uploadPicture = '';
  let uploadedSound = '';

  // ?????? ???? ???? ???????????? ???????????????????? ????
  try {
    formData.parse(req, async (err, fields, files) => {
      if (err) throw new Error(err);

      if (!Array.isArray(fields.word) && fields.word
          && !Array.isArray(fields.translation) && fields.translation
          && !Array.isArray(fields.categoryId) && fields.categoryId
          && !Array.isArray(files.picture) && files.picture && files.picture.name && files.picture.path
          && !Array.isArray(files.sound) && files.sound && files.sound.name && files.sound.path) {
        newCard.word = fields.word;
        newCard.translation = fields.translation;
        newCard.categoryId = Number(fields.categoryId);
        newCard.audio = `${PUBLIC_SOUND_PATH}${newCard.word}${getFileExt(files.sound.name)}`;
        newCard.image = `${PUBLIC_PICTURE_PATH}${newCard.word}${getFileExt(files.picture.name)}`;
        uploadPicture = files.picture.path;
        uploadedSound = files.sound.path;
      } else {
        throw new Error('smt wrong with parsing formdata');
      }
      try {
        const data = await createCard(newCard, uploadPicture, uploadedSound);
        return res.json(data);
      } catch (error) {
        return res.status(StatusCodes.BadRequest).send(error.message);
      }
    });
  } catch (error) {
    return res.status(StatusCodes.BadRequest).send(error.message);
  }
});

// router.put('/', async (req, res) => {
//   const data = req.body as Card;
//   const category = await getCategoryById(data.categoryId);
//   if (!category) {
//     return res.status(StatusCodes.BadRequest).send('Invalid category ID');
//   }
//   try {
//     const newData = await updateCard(data);
//     return res.json(newData);
//   } catch (e) {
//     return res.status(StatusCodes.BadRequest).send(e);
//   }
// });

export default router;
