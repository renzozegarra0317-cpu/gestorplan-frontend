# 📋 GUÍA RÁPIDA: REGISTRO DE TRABAJADOR

## 🚀 INICIO RÁPIDO

### **Tiempo estimado: 7-9 minutos**

Esta guía te ayudará a registrar un nuevo trabajador de forma rápida, llenando **solo los campos obligatorios**.

---

## 📝 PASO 1: DATOS PERSONALES (2 minutos)

### **Campos Obligatorios:**
1. ✅ **DNI** → 8 dígitos
2. ✅ **Apellido Paterno** → Ejemplo: GARCÍA
3. ✅ **Apellido Materno** → Ejemplo: LÓPEZ
4. ✅ **Nombres** → Ejemplo: JUAN CARLOS
5. ✅ **Fecha de Nacimiento** → Ejemplo: 15/05/1985
6. ✅ **Sexo** → M / F

### **Campos Opcionales (puedes saltarlos):**
- ⚠️ Estado Civil → Déjalo vacío si no lo sabes

### **Botón:** Presiona **"Siguiente"**

---

## 📧 PASO 2: DATOS DE CONTACTO (1 minuto)

### **Campos Obligatorios:**
1. ✅ **Celular** → 9 dígitos, empieza con 9
   - Ejemplo: **987654321**
2. ✅ **Email** → Para enviar boletas
   - Ejemplo: **juan.garcia@huanchaco.gob.pe**

### **Campos Opcionales (puedes saltarlos):**
- ⚠️ Teléfono fijo
- ⚠️ Dirección
- ⚠️ Departamento
- ⚠️ Provincia
- ⚠️ Distrito

### **Botón:** Presiona **"Siguiente"**

---

## 💼 PASO 3: DATOS LABORALES (2 minutos)

### **Campos Obligatorios:**
1. ✅ **Cargo** → Selecciona de la lista
   - Ejemplo: **Técnico Administrativo**
2. ✅ **Área** → Selecciona de la lista
   - Ejemplo: **Gerencia Municipal**
3. ✅ **Tipo de Contrato** → Selecciona según corresponda
   - Ejemplo: **CAS** o **Empleado de Confianza**
4. ✅ **Régimen Laboral** → Selecciona según corresponda
   - Ejemplo: **DL-1057** (para CAS) o **LEY-27972** (para Alcalde)
5. ✅ **Fecha de Ingreso** → Primer día de trabajo
   - Ejemplo: **01/01/2024**
6. ✅ **Fecha Inicio de Contrato** → Normalmente igual a fecha de ingreso
   - Ejemplo: **01/01/2024**

### **Campos Opcionales (puedes saltarlos):**
- ⚠️ Subgerencia → Solo si aplica
- ⚠️ Unidad → Solo si aplica
- ⚠️ Gerencia → Puede ser igual al área
- ⚠️ Fecha Fin de Contrato → **Solo para contratos a plazo fijo**

### **Botón:** Presiona **"Siguiente"**

---

## 💰 PASO 4: REMUNERACIÓN (2 minutos)

### **Campos Obligatorios:**
1. ✅ **Remuneración Básica** → Mínimo S/ 1,025
   - Ejemplo: **3,500.00**
2. ✅ **Sistema de Pensiones** → Selecciona AFP u ONP

### **Si seleccionaste AFP:**
3. ✅ **CUSPP** → 12 caracteres (números y letras)
   - Ejemplo: **592771EBANA6**
4. ✅ **Tipo de Comisión AFP** → Flujo o Mixta

### **Campos Opcionales (puedes saltarlos):**
- ⚠️ Asignación Familiar → Marca el checkbox solo si tiene hijos
- ⚠️ Número de Hijos → Solo si marcaste asignación familiar
- ⚠️ Bono de Productividad
- ⚠️ Otros Ingresos
- ⚠️ Es Sindicalizado → Checkbox

### **Botón:** Presiona **"Siguiente"**

---

## 🏦 PASO 5: DATOS BANCARIOS (2 minutos)

### **Campos Obligatorios:**
1. ✅ **Banco** → Selecciona de la lista
   - Ejemplo: **Banco de la Nación**
2. ✅ **Tipo de Cuenta** → Ahorros o Corriente
   - Ejemplo: **Ahorros**
3. ✅ **Número de Cuenta** → Número completo
   - Ejemplo: **00-123-456789**
4. ✅ **CCI** → 20 dígitos
   - Ejemplo: **01812345678901234567**

### **Botón:** Presiona **"Guardar Trabajador"**

---

## ✅ CONFIRMACIÓN

Cuando presiones **"Guardar Trabajador"**:

1. ⏳ El sistema valida todos los datos
2. 🔍 Verifica que no exista duplicado
3. 💾 Guarda en la base de datos
4. ✅ Muestra mensaje de éxito
5. 🔄 Redirige a la lista de trabajadores

---

## 🎯 CASOS ESPECIALES

### **CASO 1: Registrar al ALCALDE**

```
Paso 1: DNI, nombres completos, fecha nacimiento, sexo
Paso 2: Solo celular y email oficial
Paso 3:
  - Cargo: ALCALDE
  - Área: ALCALDÍA
  - Tipo Contrato: ALCALDE
  - Régimen: LEY-27972
  - Fecha Ingreso: 01/01/2023
  - Fecha Inicio: 01/01/2023
  - ⚠️ Fecha Fin: VACÍO (cargo por 4 años)
Paso 4: Salario, Sistema Pensiones
Paso 5: Datos bancarios completos
```

### **CASO 2: Registrar un REGIDOR**

```
Similar al Alcalde, pero:
  - Cargo: REGIDOR
  - Tipo Contrato: REGIDOR
  - Régimen: LEY-27972
```

### **CASO 3: Registrar un CAS**

```
Paso 3:
  - Tipo Contrato: CAS
  - Régimen: DL-1057 (Contrato Administrativo de Servicios)
  - Fecha Fin: ⚠️ LLENAR (contratos CAS son a plazo fijo)
```

### **CASO 4: Registrar un NOMBRADO**

```
Paso 3:
  - Tipo Contrato: NOMBRADO (Indeterminado)
  - Régimen: DL-276 (Carrera Administrativa)
  - Fecha Fin: ⚠️ VACÍO (nombrados son indefinidos)
```

### **CASO 5: Registrar EMPLEADO DE CONFIANZA**

```
Paso 3:
  - Tipo Contrato: Empleado de Confianza
  - Régimen: DL-728 (Régimen Laboral Privado)
  - Fecha Fin: ⚠️ VACÍO o según corresponda
```

---

## ⚠️ ERRORES COMUNES

### **Error 1: "Complete todos los campos obligatorios"**
**Solución:** Revisa que hayas llenado todos los campos marcados con ⭐

### **Error 2: "El DNI debe tener 8 dígitos"**
**Solución:** Verifica que sean exactamente 8 números

### **Error 3: "El celular debe comenzar con 9"**
**Solución:** Celulares en Perú empiezan con 9 (ejemplo: 987654321)

### **Error 4: "El email no es válido"**
**Solución:** Debe tener formato correcto (ejemplo@dominio.com)

### **Error 5: "El CCI debe tener 20 dígitos"**
**Solución:** Verifica que sean exactamente 20 números

### **Error 6: "El CUSPP debe tener 12 caracteres"**
**Solución:** CUSPP tiene 12 caracteres (números y letras), ejemplo: 592771EBANA6

### **Error 7: "El trabajador ya existe"**
**Solución:** Ya existe un trabajador con ese DNI

---

## 💡 CONSEJOS PROFESIONALES

### **✅ ANTES de registrar:**
1. Ten a mano el DNI del trabajador
2. Confirma su celular y email
3. Verifica su cargo y área
4. Ten sus datos bancarios (CCI completo)
5. Pregunta si es AFP u ONP (y CUSPP si es AFP)

### **✅ DURANTE el registro:**
1. Llena solo los campos obligatorios primero
2. Campos opcionales se pueden completar después
3. Si algo falta, déjalo vacío y continúa
4. Revisa bien antes de guardar

### **✅ DESPUÉS del registro:**
1. Verifica que aparezca en la lista de trabajadores
2. Completa campos opcionales si los necesitas
3. Genera su primera planilla de prueba
4. Envía su boleta de pago

---

## 🔄 COMPLETAR DATOS DESPUÉS

Si quieres completar los campos opcionales después:

1. 📋 Ve a **"Trabajadores"**
2. 🔍 Busca al trabajador
3. ✏️ Click en **"Editar"** (ícono lápiz)
4. 📝 Completa los campos que faltaron
5. 💾 Guarda cambios

---

## 📊 RESUMEN RÁPIDO

### **Campos Obligatorios por Paso:**

| Paso | Obligatorios | Tiempo |
|------|--------------|--------|
| 1. Datos Personales | 6 campos | 2 min |
| 2. Datos Contacto | 2 campos | 1 min |
| 3. Datos Laborales | 6 campos | 2 min |
| 4. Remuneración | 3 campos (5 si AFP) | 2 min |
| 5. Datos Bancarios | 4 campos | 2 min |
| **TOTAL** | **21 campos** | **7-9 min** |

---

## 📞 AYUDA

Si tienes problemas:
1. Revisa esta guía
2. Verifica los campos obligatorios
3. Consulta los casos especiales
4. Revisa la documentación completa

---

## 📖 DOCUMENTACIÓN RELACIONADA

- **`CAMBIOS_CAMPOS_OPCIONALES.md`** → Detalles de qué es opcional
- **`RESUMEN_CAMBIOS_APLICADOS.md`** → Cambios técnicos
- **`backend/COMO_REGISTRAR_ALCALDE_Y_REGIDORES.md`** → Cargos políticos
- **`backend/DATOS_REQUERIDOS_TRABAJADOR_MUNICIPAL.md`** → Requisitos legales

---

**✅ REGISTRO RÁPIDO Y FÁCIL** 🚀  
**✅ SOLO 21 CAMPOS OBLIGATORIOS** 📝  
**✅ 7-9 MINUTOS** ⏱️  
**✅ LISTO PARA USAR** ✨

