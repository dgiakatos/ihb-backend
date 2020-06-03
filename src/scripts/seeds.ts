import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vaccine } from '../users/vaccinations/vaccine.entity';
import { Role } from '../auth/models/claims.interface';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { PersonalService } from '../users/personal/personal.service';
import { AllergicService } from '../users/allergic/allergic.service';
import { HospitalService } from '../users/hospital/hospital.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    await app.init();

    const userService = app.get(UsersService);
    const authService = app.get(AuthService);
    const personalService = app.get(PersonalService);
    const allergicService = app.get(AllergicService);
    const hospitalService = app.get(HospitalService);

    const vaccinesRepo = app.get<string, Repository<Vaccine>>(getRepositoryToken(Vaccine));
    
    const user = await userService.create('user@user.com', 'test');
    await authService.setUserRole(user, Role.User);
    const doctor = await userService.create('doctor@doctor.com', 'test');
    await authService.setUserRole(doctor, Role.Doctor);

    await personalService.create({
        firstName: 'First',
        lastName: 'Last',
        ssnvs: '01234567890',
        birthDate: '1950-01-01',
        country: 'Greece',
        fatherFirstName: 'FatherFname',
        fatherLastName: 'FatherLname',
        motherFirstName: 'MotherFname',
        motherLastName: 'MotherLname',
        mobilePhone: '6912345678',
        emergencyContact: '6987654321'
    }, user.id);

    await personalService.create({
        firstName: 'Doctor',
        lastName: 'Last',
    }, doctor.id);

    await allergicService.addAllergy({
        name: 'Milk Allergy',
        dDescription: 'a',
        tDescription: 'a'
    }, user.id);
    await allergicService.addAllergy({
        name: 'Egg Allergy',
        dDescription: 'a',
        tDescription: 'a'
    }, user.id);
    await hospitalService.addHospitalTreatment({
        name: 'Ippokrateion',
        city: 'Thessaloniki',
        country: 'Greece',
        cause: 'Pneumonia',
        treatment: 'a',
        starts: '2020-01-01',
        finishes: '2020-01-04'
    }, user.id);
    await hospitalService.addHospitalTreatment({
        name: 'AHEPA',
        city: 'Thessaloniki',
        country: 'Greece',
        cause: 'Chest Pain',
        treatment: 'a',
        starts: '2020-05-01',
        finishes: '2020-05-20'
    }, user.id);

    await vaccinesRepo.insert([
        vaccinesRepo.create({ name: 'Tuberculosis' }),
        vaccinesRepo.create({ name: 'Rotavirus infection' }),
        vaccinesRepo.create({ name: 'Diphtheria' }),
        vaccinesRepo.create({ name: 'Tetanus' }),
        vaccinesRepo.create({ name: 'Pertussis' }),
        vaccinesRepo.create({ name: 'Poliomyelitis' }),
        vaccinesRepo.create({ name: 'Haemophilus influenzae type b infection' }),
        vaccinesRepo.create({ name: 'Hepatitis B' }),
        vaccinesRepo.create({ name: 'Pneumococcal disease' }),
        vaccinesRepo.create({ name: 'Meningococcal disease' }),
        vaccinesRepo.create({ name: 'Measles' }),
        vaccinesRepo.create({ name: 'Mumps' }),
        vaccinesRepo.create({ name: 'Rubella' }),
        vaccinesRepo.create({ name: 'Varicella' }),
        vaccinesRepo.create({ name: 'Human papillomavirus infection' }),
        vaccinesRepo.create({ name: 'Influenza' }),
        vaccinesRepo.create({ name: 'Herpes zoster' }),
        vaccinesRepo.create({ name: 'Hepatitis A' })
    ]);

    await app.close();
}
bootstrap().catch(err => {
    console.error(err);
    process.exit(1);
});