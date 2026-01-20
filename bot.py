import asyncio
import logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart, CommandObject, Command
from aiogram.utils.keyboard import InlineKeyboardBuilder

# ---------------------------------------------------------------------
# КОНФИГУРАЦИЯ
# ---------------------------------------------------------------------
TOKEN = "ТВОЙ_ТОКЕН_БОТА"  # Вставь сюда токен от @BotFather
ADMIN_ID = 6149064786      # Твой ID для получения скриншотов

# Ссылки на файлы (Замени ссылку для stchpr, когда загрузишь файл!)
MUSIC_FILES = {
    "hello": "https://github.com/not88g/lebedi/raw/refs/heads/main/music/hello.mp3",
    "no_words": "https://github.com/not88g/lebedi/raw/refs/heads/main/music/aftercare.m4a",
    "ny_2025": "https://github.com/not88g/lebedi/raw/refs/heads/main/music/new-year.mp3",
    # Сюда вставь ссылку на mp3 файл секретного трека:
    "stchpr": "https://github.com/not88g/lebedi/raw/refs/heads/main/music/aftercare.m4a" 
}

# Ссылки на обложки
COVERS = {
    "main": "https://raw.githubusercontent.com/not88g/lebedi/refs/heads/main/cover.png",
    "alt": "https://github.com/not88g/lebedi/raw/refs/heads/main/alt%20cover.png",
    "bitch": "https://raw.githubusercontent.com/not88g/lebedi/refs/heads/main/bitch.png"
}

# База данных доступов (в памяти)
# user_id: set("item_id", "VIP_ALL")
user_library = {}

bot = Bot(token=TOKEN)
dp = Dispatcher()

# ---------------------------------------------------------------------
# ЛОГИКА ДОСТУПА И БИБЛИОТЕКИ
# ---------------------------------------------------------------------
def has_access(user_id, item_id):
    """Проверяет, есть ли у пользователя доступ к треку"""
    lib = user_library.get(user_id, set())
    return "VIP_ALL" in lib or item_id in lib

async def show_my_music(message: types.Message):
    user_id = message.from_user.id
    builder = InlineKeyboardBuilder()
    
    # Стандартные треки
    if has_access(user_id, "hello"):
        builder.row(types.InlineKeyboardButton(text="🎵 Hello (Demo)", callback_data="play_hello"))
    if has_access(user_id, "no_words"):
        builder.row(types.InlineKeyboardButton(text="🎵 Без Слов (Сингл)", callback_data="play_no_words"))
    if has_access(user_id, "ny_2025"):
        builder.row(types.InlineKeyboardButton(text="🎵 Сияющий праздник", callback_data="play_ny"))
    
    # Секретный трек (только для VIP или купивших бонус версию)
    if has_access(user_id, "stchpr") or has_access(user_id, "VIP_ALL"):
        builder.row(types.InlineKeyboardButton(text="🔥 стчпр!рем (BONUS)", callback_data="play_stchpr"))
    
    # Заглушка
    builder.row(types.InlineKeyboardButton(text="🔒 B!TCH EP (В разработке)", callback_data="locked"))
    
    markup = builder.as_markup()
    if markup.inline_keyboard:
        text = "🎹 <b>МОЯ МУЗЫКА</b>\nВаша коллекция треков:"
    else:
        text = "📭 <b>У вас пока нет музыки.</b>\nКупите релиз на сайте или введите промокод!"
    
    await message.answer(text, reply_markup=markup, parse_mode="HTML")

# ---------------------------------------------------------------------
# ОБРАБОТЧИКИ КОМАНД (/start)
# ---------------------------------------------------------------------
@dp.message(CommandStart(deep_link=True))
async def handler_deep_link(message: types.Message, command: CommandObject):
    args = command.args
    
    # 1. ПЕРЬЯ НА АСФАЛЬТЕ (Обычная версия)
    if args == "buy_perya_ep":
        text = (
            "<b>📀 ПЕРЬЯ НА АСФАЛЬТЕ</b>\n"
            "Дебютный вокальный EP.\n\n"
            "<i>Треклист:</i>\n"
            "1. Без Слов\n2. Hello\n3. Смешно и Весело!\n"
            "4. Фристайл\n5. Мертвые Мечты\n6. Ответ: Гудбай\n7. Конечная Остановка\n\n"
            "💰 <b>Стоимость: 100⭐ (180 руб / 2 USD)</b>"
        )
        await send_product_card(message, COVERS["main"], text, "perya_ep")

    # 2. ПЕРЬЯ НА АСФАЛЬТЕ (Бонус версия)
    elif args == "buy_perya_bonus_ep":
        text = (
            "<b>🎁 ПЕРЬЯ НА АСФАЛЬТЕ (BONUS EDITION)</b>\n"
            "Лимитированная версия с альтернативной обложкой!\n\n"
            "🔥 <b>Включает секретный трек: стчпр!рем</b>\n\n"
            "💰 <b>Стоимость: 100⭐ (180 руб / 2 USD)</b>"
        )
        await send_product_card(message, COVERS["alt"], text, "perya_bonus_ep")

    # 3. ДРУГИЕ РЕЛИЗЫ
    elif args == "buy_bitch_ep":
        # Пример заглушки, если релиз еще не готов к продаже
        await message.answer("Этот релиз пока недоступен для покупки.")

async def send_product_card(message, photo, text, item_id):
    """Вспомогательная функция для отправки карточки товара"""
    builder = InlineKeyboardBuilder()
    builder.row(types.InlineKeyboardButton(text="Купить (РФ / СНГ - TON)", callback_data=f"pay_cis_{item_id}"))
    builder.row(types.InlineKeyboardButton(text="Buy (PayPal / World)", callback_data=f"pay_world_{item_id}"))
    builder.row(types.InlineKeyboardButton(text="Промокод", callback_data="enter_promo"))
    
    await message.answer_photo(
        photo=photo,
        caption=text,
        reply_markup=builder.as_markup(),
        parse_mode="HTML"
    )

@dp.message(Command("my_music"))
async def cmd_my_music(message: types.Message):
    await show_my_music(message)

# ---------------------------------------------------------------------
# ОПЛАТА И ПРОМОКОДЫ
# ---------------------------------------------------------------------
@dp.callback_query(F.data == "enter_promo")
async def ask_promo(callback: types.CallbackQuery):
    await callback.message.answer("⌨️ Введите ваш промокод в чат:")
    await callback.answer()

@dp.message(F.text == "VENUSISSOMEKINDOFSUPERNOVA")
async def promo_success(message: types.Message):
    user_id = message.from_user.id
    if user_id not in user_library: user_library[user_id] = set()
    
    # Выдаем полный доступ
    user_library[user_id].update(["VIP_ALL", "hello", "no_words", "ny_2025", "stchpr"])
    
    builder = InlineKeyboardBuilder()
    builder.add(types.InlineKeyboardButton(text="🎧 СЛУШАТЬ МУЗЫКУ", callback_data="open_main_menu"))
    
    await message.answer(
        "🔓 <b>VENUS MODE ACTIVATED!</b>\n"
        "Вы получили VIP-доступ ко всей дискографии и бонусным трекам.",
        reply_markup=builder.as_markup(),
        parse_mode="HTML"
    )

@dp.callback_query(F.data == "open_main_menu")
async def menu_callback(callback: types.CallbackQuery):
    await show_my_music(callback.message)

# ---------------------------------------------------------------------
# ОБРАБОТКА "ОПЛАТЫ" (Реквизиты)
# ---------------------------------------------------------------------
@dp.callback_query(F.data.startswith("pay_cis_"))
async def pay_cis(callback: types.CallbackQuery):
    await callback.message.answer(
        "💎 <b>ОПЛАТА ЧЕРЕЗ TONCOIN (@wallet)</b>\n\n"
        "Сумма: <b>1.44 TON</b> (или эквивалент 180 руб)\n"
        "Кошелек: <code>UQDhxRw3SSCy71Q_Vx_DiFfzj3bptDZfbpEcFF6BRd6ujuOO</code>\n\n"
        "1. Сделайте перевод.\n"
        "2. Пришлите <b>скриншот</b> чека сюда.\n"
        "3. Админ выдаст доступ!",
        parse_mode="HTML"
    )
    await callback.answer()

@dp.callback_query(F.data.startswith("pay_world_"))
async def pay_world(callback: types.CallbackQuery):
    await callback.message.answer(
        "🌍 <b>PAYPAL PAYMENT</b>\n\n"
        "Price: <b>2.00 USD</b>\n"
        "Email: <code>safeplayer@icloud.com</code>\n\n"
        "1. Send payment.\n"
        "2. Send a <b>screenshot</b> here.\n"
        "3. We will unlock the music for you!",
        parse_mode="HTML"
    )
    await callback.answer()

# ---------------------------------------------------------------------
# ОБРАБОТКА СКРИНШОТОВ И АДМИНКА
# ---------------------------------------------------------------------
@dp.message(F.photo)
async def handle_screenshot(message: types.Message):
    # Пересылаем скриншот админу
    await message.forward(chat_id=ADMIN_ID)
    
    # Уведомляем админа с кнопкой быстрой выдачи (для удобства можно просто ID копировать)
    await bot.send_message(
        ADMIN_ID, 
        f"🔔 <b>НОВЫЙ ЗАКАЗ!</b>\nЮзер ID: <code>{message.from_user.id}</code>\n@{message.from_user.username}",
        parse_mode="HTML"
    )
    
    await message.answer("✅ Скриншот принят! Ожидайте подтверждения от админа.")

# Команда админа: /give_access 12345678 item_name
@dp.message(Command("give_access"))
async def admin_give_access(message: types.Message):
    if message.from_user.id != ADMIN_ID: return
    try:
        _, target_id_str, item = message.text.split()
        target_id = int(target_id_str)
        
        if target_id not in user_library: user_library[target_id] = set()
        
        # Если выдаем "perya", даем все треки
        if "perya" in item:
            user_library[target_id].update(["hello", "no_words", "ny_2025"])
            # Если бонусная - добавляем секретку
            if "bonus" in item:
                user_library[target_id].add("stchpr")
        else:
            user_library[target_id].add(item)
            
        await message.answer(f"✅ Доступ выдан ID {target_id} к '{item}'")
        await bot.send_message(target_id, "🌟 <b>Оплата подтверждена!</b>\nВаша музыка доступна в меню /my_music", parse_mode="HTML")
    except Exception as e:
        await message.answer(f"Ошибка: {e}\nПример: /give_access 12345678 perya_bonus_ep")

# ---------------------------------------------------------------------
# ПЛЕЕР (ОТПРАВКА ФАЙЛОВ)
# ---------------------------------------------------------------------
@dp.callback_query(F.data.startswith("play_"))
async def play_file(callback: types.CallbackQuery):
    track_key = callback.data.replace("play_", "")
    user_id = callback.from_user.id
    
    if not has_access(user_id, track_key) and not has_access(user_id, "VIP_ALL"):
        await callback.answer("⛔ Нет доступа. Купите релиз или введите чит-код.", show_alert=True)
        return

    await callback.message.answer("🚀 Загружаю файл...")
    
    # Специальная логика для бонусного трека (обложка)
    if track_key == "stchpr":
        await callback.message.answer_audio(
            audio=MUSIC_FILES["stchpr"],
            title="стчпр!рем (BONUS)",
            performer="2 Лебедя",
            thumbnail=types.URLInputFile(COVERS["alt"])
        )
    elif track_key in MUSIC_FILES:
        await callback.message.answer_audio(
            audio=MUSIC_FILES[track_key],
            title=track_key.capitalize(), # Можно сделать красивый маппинг названий
            performer="2 Лебедя"
        )
    
    await callback.answer()

@dp.callback_query(F.data == "locked")
async def locked_handler(callback: types.CallbackQuery):
    await callback.answer("🔒 Этот релиз находится в разработке.", show_alert=True)

async def main():
    print("Бот запущен...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
