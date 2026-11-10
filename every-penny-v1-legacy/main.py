import flet as ft
import database
from views import AppViews

def main(page: ft.Page):
    database.init_db()

    page.title = "Every Penny"
    page.theme_mode = ft.ThemeMode.DARK
    page.padding = ft.padding.only(left=20, right=20, top=40, bottom=20)
    page.scroll = ft.ScrollMode.AUTO

    body_container = ft.Container(expand=True)

    page.add(
        ft.Text("Every Penny Counts - No cloud", size=26, weight=ft.FontWeight.BOLD, color=ft.Colors.BLUE_400),
        body_container,
    )

    app = AppViews(page, body_container)
    app.show_home()

ft.app(target=main, view=ft.AppView.WEB_BROWSER)