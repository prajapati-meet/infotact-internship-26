# 🚀 Guide: How to Run the JMeter Load Test

This guide explains how to clean up, seed the database, run the load test, and troubleshoot database connection issues.

---

## 📋 Prerequisites
1. **PostgreSQL** must be running.
2. **Redis** must be running.
3. **Apache JMeter** must be installed (currently configured at `C:\apache-jmeter-5.6.3`).

---

## 🏃 Steps to Run the Test

### Step 1: Delete Old Results
JMeter appends new test results to the existing `results.jtl` file. To get a clean report, delete the old file first:
```powershell
Remove-Item "jmeter/results.jtl" -Force
```

### Step 2: Seed the Database & Generate fresh JWT Token
The database seeder cleans up old JMeter users, populates their balances, and creates a fresh valid token in `jmeter/config.properties`:
```powershell
# Run the database seeder test from the main backend folder:
.\mvnw.cmd test -Dtest=DatabaseSeeder
```

### Step 3: Start the Backend Server
Start the Spring Boot backend server:
```powershell
.\mvnw.cmd spring-boot:run
```
*Wait until you see `Started LedgerApplication` in the logs.*

### Step 4: Execute the JMeter Test
Run the test in CLI mode (non-GUI mode) using the seeder configurations:
```powershell
# Change directory to the jmeter folder:
cd jmeter

# Run the test command:
C:\apache-jmeter-5.6.3\bin\jmeter.bat -n -t transfer_load_test.jmx -l results.jtl -q config.properties
```

---

## 🛠️ Troubleshooting

### Error: `FATAL: sorry, too many clients already`
If you see this error, it means stale Java background processes are holding onto the database connections. 

**Solution:** Kill all running Java processes to free the connections, then try running the server again:
```powershell
taskkill /f /im java.exe
```
