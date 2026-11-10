# Every Penny Counts 💸

A simple, offline-first expense & earnings tracker built with [Flet](https://flet.dev) — no cloud, no accounts, just your data on your device.

![License](https://img.shields.io/github/license/Leleouch14/Every_Penny)
![Downloads](https://img.shields.io/github/downloads/Leleouch14/Every_Penny/total)
![Build](https://img.shields.io/github/actions/workflow/status/Leleouch14/Every_Penny/build.yml?label=build)
![Stars](https://img.shields.io/github/stars/Leleouch14/Every_Penny?style=social)

## Features

- 📥 Log expenses and earnings with a date, amount, and note
- 📊 Daily and monthly spending reports
- 🔒 100% local — data is stored in a SQLite database on your device, nothing leaves your phone
- 🌙 Dark theme by default

## Download

Grab the latest Android APK from the [Releases page](https://github.com/Leleouch14/Every_Penny/releases/latest).

> [!NOTE]
> Since this isn't published on the Play Store, Android will warn about installing from an unknown source. That's expected for a sideloaded open-source app — you can allow it in your phone's settings.

## Running from source

**Requirements:** Python 3.9+

```bash
git clone https://github.com/Leleouch14/Every_Penny.git
cd Every_Penny
pip install -r requirements.txt
python main.py
```

This launches the app in your default web browser (Flet's web view). To build it yourself for Android:

```bash
flet build apk
```

## Tech stack

- [Flet](https://flet.dev) — Python UI framework (Flutter under the hood)
- SQLite — local, embedded storage, no server required

## Contributing

Issues and PRs are welcome! If you spot a bug or have a feature idea, feel free to open an issue.

## License

Released under the [MIT License](LICENSE).
