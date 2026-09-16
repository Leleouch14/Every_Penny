import flet as ft
from datetime import datetime
import database
import reports

class AppViews:
    def __init__(self, page: ft.Page, body_container: ft.Container):
        self.page = page
        self.body_container = body_container

    def show_home(self, e=None):
        now = datetime.now()
        month_suffix = now.strftime("-%m-%Y")
        month_label = now.strftime("%B %Y")

        monthly_exp = database.fetch_current_month_expenses(month_suffix)

        self.body_container.content = ft.Column(
            controls=[
                ft.Row(
                    alignment=ft.MainAxisAlignment.CENTER,
                    controls=[
                        ft.Text(
                            f"{month_label} Expenses: - ₹{monthly_exp:,.2f}", 
                            size=24, 
                            weight=ft.FontWeight.BOLD, 
                            color=ft.Colors.RED_400
                        ),
                    ],
                ),
                ft.Row(
                    alignment=ft.MainAxisAlignment.CENTER,
                    controls=[
                        ft.Text("Expense Ledger", size=22, weight=ft.FontWeight.BOLD, color=ft.Colors.RED_400),
                        ft.ElevatedButton("Log Expense", icon=ft.Icons.ADD, on_click=self.show_log_expense),
                    ],
                ),
                ft.Row(
                    alignment=ft.MainAxisAlignment.CENTER,
                    controls=[
                        ft.Text("Earnings Ledger", size=22, weight=ft.FontWeight.BOLD, color=ft.Colors.GREEN_400),
                        ft.ElevatedButton("Log Earnings", icon=ft.Icons.ADD, on_click=self.show_log_earning),
                    ],
                ),
                ft.Row(
                    alignment=ft.MainAxisAlignment.CENTER,
                    controls=[
                        ft.ElevatedButton("View Reports (Daily / Monthly)", icon=ft.Icons.BAR_CHART, on_click=self.show_reports),
                    ],
                ),
                ft.Divider(height=10, color=ft.Colors.TRANSPARENT),
                ft.Column(
                    controls=[
                        self.build_expenses_table(),
                        self.build_earnings_table(),
                    ],
                    scroll=ft.ScrollMode.AUTO,
                ),
            ],
            spacing=15,
        )
        self.page.update()

    def build_expenses_table(self):
        records = database.fetch_expenses()
        if not records:
            return ft.Text("No expenses logged yet.", size=16, color=ft.Colors.GREY_500)

        table = ft.DataTable(
            border=ft.border.all(1, ft.Colors.OUTLINE_VARIANT),
            border_radius=10,
            heading_row_color=ft.Colors.SURFACE_CONTAINER_HIGHEST,
            columns=[
                ft.DataColumn(ft.Text("ID", weight=ft.FontWeight.BOLD)),
                ft.DataColumn(ft.Text("Date", weight=ft.FontWeight.BOLD)),
                ft.DataColumn(ft.Text("Description", weight=ft.FontWeight.BOLD)),
                ft.DataColumn(ft.Text("Amount", weight=ft.FontWeight.BOLD), numeric=True),
            ],
            rows=[
                ft.DataRow(
                    cells=[
                        ft.DataCell(ft.Text(f"#{row[0]}")),
                        ft.DataCell(ft.Text(str(row[1]))),
                        ft.DataCell(ft.Text(str(row[2]))),
                        ft.DataCell(ft.Text(f"- ₹{row[3]:,.2f}", color=ft.Colors.RED_400, weight=ft.FontWeight.BOLD)),
                    ]
                )
                for row in records
            ],
        )
        return ft.Row(controls=[table], scroll=ft.ScrollMode.AUTO)

    def build_earnings_table(self):
        records = database.fetch_earnings()
        if not records:
            return ft.Text("No earnings logged yet.", size=16, color=ft.Colors.GREY_500)

        table = ft.DataTable(
            border=ft.border.all(1, ft.Colors.OUTLINE_VARIANT),
            border_radius=10,
            heading_row_color=ft.Colors.SURFACE_CONTAINER_HIGHEST,
            columns=[
                ft.DataColumn(ft.Text("ID", weight=ft.FontWeight.BOLD)),
                ft.DataColumn(ft.Text("Date", weight=ft.FontWeight.BOLD)),
                ft.DataColumn(ft.Text("Description", weight=ft.FontWeight.BOLD)),
                ft.DataColumn(ft.Text("Amount", weight=ft.FontWeight.BOLD), numeric=True),
            ],
            rows=[
                ft.DataRow(
                    cells=[
                        ft.DataCell(ft.Text(f"#{row[0]}")),
                        ft.DataCell(ft.Text(str(row[1]))),
                        ft.DataCell(ft.Text(str(row[2]))),
                        ft.DataCell(ft.Text(f"+ ₹{row[3]:,.2f}", color=ft.Colors.GREEN_400, weight=ft.FontWeight.BOLD)),
                    ]
                )
                for row in records
            ],
        )
        return ft.Row(controls=[table], scroll=ft.ScrollMode.AUTO)

    def show_log_expense(self, e=None):
        amount_input = ft.TextField(label="Amount", keyboard_type=ft.KeyboardType.NUMBER, prefix_icon="₹")
        note_input = ft.TextField(label="Note / Description")
        status_text = ft.Text("", size=14)

        def save_and_return(e):
            try:
                amt = float(amount_input.value)
                desc = note_input.value.strip()
                current_date = datetime.now().strftime("%d-%m-%Y")
                if amt <= 0 or not desc:
                    status_text.value = "Enter a valid amount and note."
                    status_text.color = ft.Colors.RED_400
                    self.page.update()
                    return

                database.add_expense(current_date, amt, desc)
                self.show_home()
            except (ValueError, TypeError):
                status_text.value = "Amount must be a valid number."
                status_text.color = ft.Colors.RED_400
                self.page.update()

        self.body_container.content = ft.Column(
            controls=[
                ft.Text("Log New Expense", size=22, weight=ft.FontWeight.BOLD),
                amount_input,
                note_input,
                status_text,
                ft.ElevatedButton("Save Entry", icon=ft.Icons.SAVE, on_click=save_and_return),
                ft.ElevatedButton("Cancel", icon=ft.Icons.ARROW_BACK, on_click=self.show_home),
            ],
            spacing=15,
        )
        self.page.update()

    def show_log_earning(self, e=None):
        amount_input = ft.TextField(label="Amount", keyboard_type=ft.KeyboardType.NUMBER, prefix_icon="₹")
        note_input = ft.TextField(label="Note / Description")
        status_text = ft.Text("", size=14)

        def save_and_return(e):
            try:
                amt = float(amount_input.value)
                desc = note_input.value.strip()
                current_date = datetime.now().strftime("%d-%m-%Y")
                if amt <= 0 or not desc:
                    status_text.value = "Enter a valid amount and note."
                    status_text.color = ft.Colors.RED_400
                    self.page.update()
                    return

                database.add_earning(current_date, amt, desc)
                self.show_home()
            except (ValueError, TypeError):
                status_text.value = "Amount must be a valid number."
                status_text.color = ft.Colors.RED_400
                self.page.update()

        self.body_container.content = ft.Column(
            controls=[
                ft.Text("Log Earning", size=22, weight=ft.FontWeight.BOLD),
                amount_input,
                note_input,
                status_text,
                ft.ElevatedButton("Save Entry", icon=ft.Icons.SAVE, on_click=save_and_return),
                ft.ElevatedButton("Cancel", icon=ft.Icons.ARROW_BACK, on_click=self.show_home),
            ],
            spacing=15,
        )
        self.page.update()

    def show_reports(self, e=None):
        daily_summary = reports.get_daily_summary()
        monthly_summary = reports.get_monthly_expenses()

        def build_summary_table(summary, label_col):
            if not summary:
                return ft.Text("No data yet.", size=16, color=ft.Colors.GREY_500)

            return ft.DataTable(
                border=ft.border.all(1, ft.Colors.OUTLINE_VARIANT),
                border_radius=10,
                heading_row_color=ft.Colors.SURFACE_CONTAINER_HIGHEST,
                columns=[
                    ft.DataColumn(ft.Text(label_col, weight=ft.FontWeight.BOLD)),
                    ft.DataColumn(ft.Text("Total Spent", weight=ft.FontWeight.BOLD), numeric=True),
                ],
                rows=[
                    ft.DataRow(
                        cells=[
                            ft.DataCell(ft.Text(str(key))),
                            ft.DataCell(ft.Text(f"- ₹{total:,.2f}", color=ft.Colors.RED_400, weight=ft.FontWeight.BOLD)),
                        ]
                    )
                    for key, total in summary
                ],
            )

        self.body_container.content = ft.Column(
            controls=[
                ft.Text("Expense Reports", size=22, weight=ft.FontWeight.BOLD),
                ft.Tabs(
                    selected_index=0,
                    length=2,
                    animation_duration=300,
                    content=ft.Column(
                        controls=[
                            ft.TabBar(
                                tabs=[
                                    ft.Tab(label="Daily"),
                                    ft.Tab(label="Monthly"),
                                ],
                            ),
                            ft.Container(
                                height=400,
                                content=ft.TabBarView(
                                    controls=[
                                        ft.Container(content=build_summary_table(daily_summary, "Day of Month"), padding=15),
                                        ft.Container(content=build_summary_table(monthly_summary, "Month"), padding=15),
                                    ],
                                ),
                            ),
                        ],
                    ),
                ),
                ft.ElevatedButton("Back", icon=ft.Icons.ARROW_BACK, on_click=self.show_home),
            ],
            spacing=15,
        )
        self.page.update()