import database

MONTH_NAMES = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
    "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
}

def get_daily_summary():
    records = database.fetch_expense_dates_and_amounts()
    totals = {}
    for date_str, amount in records:
        try:
            day = date_str.split("-")[0]
        except (AttributeError, IndexError):
            continue
        totals[day] = totals.get(day, 0.0) + amount
    return sorted(totals.items(), key=lambda item: int(item[0]))

def get_monthly_expenses():
    records = database.fetch_expense_dates_and_amounts()
    totals = {}
    for date_str, amount in records:
        try:
            _, month, year = date_str.split("-")
        except (AttributeError, ValueError):
            continue
        key = (year, month)
        totals[key] = totals.get(key, 0.0) + amount
    
    sorted_items = sorted(totals.items(), key=lambda item: (item[0][0], item[0][1]))
    return [
        (f"{MONTH_NAMES.get(month, month)} {year}", total)
        for (year, month), total in sorted_items
    ]