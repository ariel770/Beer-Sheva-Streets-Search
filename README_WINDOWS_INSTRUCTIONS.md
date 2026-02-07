
## הוראות הרצה ב-Windows 🪟

1.  **התקנת Docker Desktop**:
    - וודא שמותקן אצלך [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
    - בהגדרות ה-Docker, זכור לסמן את האפשרות `Use Docker Compose V2`.

2.  **הורדת הפרויקט**:
    - פתח את PowerShell או Command Prompt.
    - הורד את הפרויקט (Clone) או חלץ אותו מקובץ ZIP.
    - היכנס לתיקייה:
      ```powershell
      cd beer-sheva-streets
      ```

3.  **הרצת הפרויקט**:
    - בצע את הפקודה הבאה ללא שינוי:
      ```powershell
      docker-compose up -d --build
      ```
    - אם אתה נתקל בשגיאות הרשאה, נסה להפעיל את הטרמינל כמנהל (Run as Administrator).

4.  **שימוש במערכת**:
    - המתן מספר שניות לעליית ה-Containers.
    - פתח את הדפדפן וגש לכתובת: [http://localhost:3000](http://localhost:3000).
