/* проверяем, лайкнул ли текущий пользователь карточку
возвращает true если пользователь лайкнул карточку
*/
export const isCardLiked = (likes, userId) => {
  return likes.some((user) => user._id === userId);
};

/* обновление счетчика лайков на карточке */
export const updateLikesCount = (cardElement, likesCount) => {
  const likeCountElement = cardElement.querySelector(".card__like-count");
  if (likeCountElement) {
    likeCountElement.textContent = likesCount;
  }
};

/* переключение визуального состояния кнопки лайка */
export const toggleLikeButton = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

/* удаление карточки из dom */
export const deleteCard = (cardElement) => {
  cardElement.remove();
};

/* клонирование шаблона из dom, возвращает клонированную карточку */
const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

/* создаем dom-элемент с данными и обработчиками событий */
export const createCardElement = (cardData, currentUserId, callbacks) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCount = cardElement.querySelector(".card__like-count");

  /* заполняем данные карточки */
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardElement.querySelector(".card__title").textContent = cardData.name;

  /* устанавливаем начальное количество лайков */
  if (likeCount) {
    likeCount.textContent = cardData.likes.length;
  }

  /* устанавливаем начальное состояние лайка */
  if (isCardLiked(cardData.likes, currentUserId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  /* показываем кнопку удаления только для своих карточек */
  if (cardData.owner._id !== currentUserId) {
    deleteButton.remove();
  } else if (callbacks.onDeleteCard) {
    deleteButton.addEventListener("click", () => {
      callbacks.onDeleteCard(cardElement, cardData._id);
    });
  }

  /* обработчик лайка */
  if (callbacks.onLikeIcon) {
    likeButton.addEventListener("click", () => {
      const isLiked = likeButton.classList.contains("card__like-button_is-active");
      callbacks.onLikeIcon(cardElement, cardData._id, isLiked);
    });
  }

  /* обработчик просмотра изображения */
  if (callbacks.onPreviewPicture) {
    cardImage.addEventListener("click", () => {
      callbacks.onPreviewPicture({ name: cardData.name, link: cardData.link });
    });
  }

  /* обработчик кнопки информации (1 вариант) */
  if (infoButton && callbacks.onInfoClick) {
    infoButton.addEventListener("click", () => {
      callbacks.onInfoClick(cardData._id);
    });
  }

  return cardElement;
};
