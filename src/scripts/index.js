/* api функции для работы с сервером */
import {
  getUserInfo,
  getCardList,
  updateUserInfo,
  updateUserAvatar,
  createNewCard,
  removeCard,
  toggleCardLike,
} from "./components/api.js";

/* функции для работы с карточками */
import {
  createCardElement,
  deleteCard,
  toggleLikeButton,
  updateLikesCount,
} from "./components/card.js";

/* функции для работы с модальными окнами */
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";

/* функции валидации форм */
import {
  enableValidation,
  clearValidation,
  enableButton,
} from "./components/validation.js";

/* стили */
import "../pages/index.css";

/* конфигурация валидации */
/* настройки селекторов и классов для валидации форм */
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

/* включаем валидацию для всех форм */
enableValidation(validationSettings);

/* глобальные переменные */
/* id текущего пользователя (заполняется при загрузке данных с сервера) */
let currentUserId = null;

/* временные переменные для хранения данных удаляемой карточки */ 
let cardToDelete = null;
let cardIdToDelete = null;

/* dom узлы */
/* контейнер для карточек */
const placesWrap = document.querySelector(".places__list");

/* профиль пользователя */
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

/* модальное окно редактирования профиля */
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileFormButton = profileForm.querySelector(".popup__button");

/* модальное окно добавления карточки */
const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardFormButton = cardForm.querySelector(".popup__button");

/* модальное окно просмотра изображения */
const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

/* модальное окно обновления аватара */
const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarFormButton = avatarForm.querySelector(".popup__button");

/* модальное окно подтверждения удаления карточки */
const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const removeCardButton = removeCardForm.querySelector(".popup__button");

/* модальное окно информации о карточке (1 вариант) */
const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoLikesTitle = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoLikesList = cardInfoModalWindow.querySelector(".popup__list");

/* вспомогательные функции */
/* изменяет текст кнопки и блокирует либо разблокирует ее */
const setButtonLoadingState = (button, isLoading, loadingText, defaultText) => {
  if (isLoading) {
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = defaultText;
    button.disabled = false;
  }
};

/* форматирует дату в русском формате, возвращает отформатированную строку даты */
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/* создает элемент строки информации из шаблона, возвращает dom-элемент строки информации */
const createInfoString = (term, description) => {
  const template = document
    .getElementById("popup-info-definition-template")
    .content.querySelector(".popup__info-item")
    .cloneNode(true);

  template.querySelector(".popup__info-term").textContent = term;
  template.querySelector(".popup__info-description").textContent = description;

  return template;
};

/* создает элемент с именем пользователя из шаблона, возвращает dom-элемент с именем */
const createUserBadge = (userName) => {
  const template = document
    .getElementById("popup-info-user-preview-template")
    .content.querySelector(".popup__list-item")
    .cloneNode(true);

  /* ограничиваем длину имени для отображения */
  const displayName = userName.length > 12 ? userName.slice(0, 12) + "..." : userName;
  template.textContent = displayName;
  template.title = userName;

  return template;
};

/* обработчики событий */
/* обработчик клика по изображению карточки - открывает модальное окно с изображением */
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

/* обработчик клика по кнопке лайка - отправляет запрос на сервер */
const handleLikeCard = (cardElement, cardId, isLiked) => {
  toggleCardLike(cardId, isLiked)
    .then((updatedCard) => {
      const likeButton = cardElement.querySelector(".card__like-button");
      toggleLikeButton(likeButton);
      updateLikesCount(cardElement, updatedCard.likes.length);
    })
    .catch((err) => {
      console.log(err);
    });
};

/* обработчик клика по кнопке удаления - открывает модальное окно с подтверждением */
const handleDeleteCardClick = (cardElement, cardId) => {
  cardToDelete = cardElement;
  cardIdToDelete = cardId;
  openModalWindow(removeCardModalWindow);
};

/* обработчик подтверждения удаления карточки */
const handleRemoveCardConfirm = (evt) => {
  evt.preventDefault();
  setButtonLoadingState(removeCardButton, true, "Удаление...", "Да");

  removeCard(cardIdToDelete)
    .then(() => {
      deleteCard(cardToDelete);
      closeModalWindow(removeCardModalWindow);
      cardToDelete = null;
      cardIdToDelete = null;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonLoadingState(removeCardButton, false, "Удаление...", "Да");
    });
};

/* обработчик клика по кнопке информации - открывает модальное окно со статистикой (1 вариант) */
const handleInfoClick = (cardId) => {
  /* получаем актуальные данные карточек с сервера */
  getCardList()
    .then((cards) => {
      /* поиск карточки по id */
      const cardData = cards.find((card) => card._id === cardId);

      if (!cardData) {
        console.log("Карточка не найдена");
        return;
      }

      /* очистка предыдущего содержимого */
      cardInfoModalInfoList.innerHTML = "";
      cardInfoLikesList.innerHTML = "";

      cardInfoTitle.textContent = "Информация о карточке";

      /* информация о карточке */
      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name)
      );
      cardInfoModalInfoList.append(
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt)))
      );
      cardInfoModalInfoList.append(
        createInfoString("Владелец:", cardData.owner.name)
      );
      cardInfoModalInfoList.append(
        createInfoString("Количество лайков:", cardData.likes.length.toString())
      );

      /* список лайков */
      cardInfoLikesTitle.textContent =
        cardData.likes.length > 0 ? "Лайкнули:" : "";

      /* имена пользователей, лайкнувших карточку */
      cardData.likes.forEach((user) => {
        cardInfoLikesList.append(createUserBadge(user.name));
      });

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

/* обработчик отправки формы редактирования профиля */
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  setButtonLoadingState(profileFormButton, true, "Сохранение...", "Сохранить");

  updateUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonLoadingState(profileFormButton, false, "Сохранение...", "Сохранить");
    });
};

/* обработчик отправки формы обновления аватара */
const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  setButtonLoadingState(avatarFormButton, true, "Сохранение...", "Сохранить");

  updateUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonLoadingState(avatarFormButton, false, "Сохранение...", "Сохранить");
    });
};

/* обработчик отправки формы добавления карточки */
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  setButtonLoadingState(cardFormButton, true, "Создание...", "Создать");

  createNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      /* добавление новой карточки в начало списка */
      placesWrap.prepend(
        createCardElement(cardData, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCardClick,
          onInfoClick: handleInfoClick,
        })
      );
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonLoadingState(cardFormButton, false, "Создание...", "Создать");
    });
};

/* обработчики открытия модальных окон */
/* обработчик открытия формы редактирования профиля */
openProfileFormButton.addEventListener("click", () => {
  /* заполнение поля текущими данными */
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  /* очистка ошибок валидации */
  clearValidation(profileForm, validationSettings);
  /* активация кнопки */
  enableButton(profileFormButton, validationSettings);
  openModalWindow(profileFormModalWindow);
});

/* обработчик открытия формы обновления аватара */
profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

/* обработчик открытия формы добавления карточки */
openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

/* подписка на события форм */
profileForm.addEventListener("submit", handleProfileFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardConfirm);

/* настройка закрытия модальных окон */
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

/* инициализация */
/* загружает начальные данные с сервера и отображает их на странице */
Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    /* сохранение id текущего пользователя */
    currentUserId = userData._id;

    /* обновление данных профиля на странице */
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    /* отображение карточек */
    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCardClick,
          onInfoClick: handleInfoClick,
        })
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
