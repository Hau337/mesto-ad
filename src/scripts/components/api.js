const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-202",
  headers: {
    authorization: "afd1a2c8-1d92-4db4-bc3d-eb53898c648a",
    "Content-Type": "application/json",
  },
};

/* проверяем ответ от сервера */
const parseResponse = (response) => {
  if (response.ok) {
    return response.json();
  }
  return Promise.reject(`Ошибка: ${response.status}`);
};

/* получение данных пользователя с сервера */
export const getUserInfo = () => {
  return fetch(`${config.baseUrl}/users/me`, {
    headers: config.headers,
  }).then(parseResponse);
};

/* загрузка списка карточек с сервера */
export const getCardList = () => {
  return fetch(`${config.baseUrl}/cards`, {
    headers: config.headers,
  }).then(parseResponse);
};

/* обновление информации о пользователе */
export const updateUserInfo = (userData) => {
  return fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      name: userData.name,
      about: userData.about,
    }),
  }).then(parseResponse);
};

/* обновление аватара пользователя */
export const updateUserAvatar = (avatarData) => {
  return fetch(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      avatar: avatarData.avatar,
    }),
  }).then(parseResponse);
};

/* добавление новой карточки на сервер */
export const createNewCard = (cardData) => {
  return fetch(`${config.baseUrl}/cards`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({
      name: cardData.name,
      link: cardData.link,
    }),
  }).then(parseResponse);
};

/* удаление карточки */
export const removeCard = (cardId) => {
  return fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: "DELETE",
    headers: config.headers,
  }).then(parseResponse);
};

/* установка или снятие лайка с карточки */
export const toggleCardLike = (cardId, isLiked) => {
  const method = isLiked ? "DELETE" : "PUT";
  return fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
    method: method,
    headers: config.headers,
  }).then(parseResponse);
};