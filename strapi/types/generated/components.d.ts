import type { Schema, Struct } from '@strapi/strapi';

export interface SharedContactInfo extends Struct.ComponentSchema {
  collectionName: 'components_shared_contact_infos';
  info: {
    description: 'Kontaktn\u00ED \u00FAdaje v\u010Detn\u011B adresy, telefonu, e-mailu a webu';
    displayName: 'Kontaktn\u00ED \u00FAdaje';
    icon: 'phone';
  };
  attributes: {
    address: Schema.Attribute.Text;
    email: Schema.Attribute.Email;
    phone: Schema.Attribute.String;
    phones: Schema.Attribute.JSON;
    website: Schema.Attribute.String;
  };
}

export interface SharedDepartment extends Struct.ComponentSchema {
  collectionName: 'components_shared_departments';
  info: {
    description: 'Odd\u011Blen\u00ED v r\u00E1mci \u00FA\u0159adu';
    displayName: 'Odd\u011Blen\u00ED';
    icon: 'building';
  };
  attributes: {
    address: Schema.Attribute.Text;
    contacts: Schema.Attribute.Component<'shared.department-contact', true>;
    departmentId: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    email: Schema.Attribute.Email;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    phone: Schema.Attribute.String;
  };
}

export interface SharedDepartmentContact extends Struct.ComponentSchema {
  collectionName: 'components_shared_department_contacts';
  info: {
    description: 'Kontaktn\u00ED osoba v r\u00E1mci odd\u011Blen\u00ED';
    displayName: 'Kontakt odd\u011Blen\u00ED';
    icon: 'user';
  };
  attributes: {
    email: Schema.Attribute.Email;
    phone: Schema.Attribute.String;
    role: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SharedService extends Struct.ComponentSchema {
  collectionName: 'components_shared_services';
  info: {
    description: 'Slu\u017Eba poskytovan\u00E1 organizac\u00ED';
    displayName: 'Slu\u017Eba';
    icon: 'briefcase';
  };
  attributes: {
    contact: Schema.Attribute.Component<'shared.contact-info', false>;
    description: Schema.Attribute.RichText;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    serviceId: Schema.Attribute.String;
  };
}

export interface SharedStaffMember extends Struct.ComponentSchema {
  collectionName: 'components_shared_staff_members';
  info: {
    description: 'Zam\u011Bstnanec zdravotnick\u00E9ho za\u0159\u00EDzen\u00ED';
    displayName: 'Zam\u011Bstnanec';
    icon: 'user';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    phone: Schema.Attribute.String;
    specialty: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.contact-info': SharedContactInfo;
      'shared.department': SharedDepartment;
      'shared.department-contact': SharedDepartmentContact;
      'shared.service': SharedService;
      'shared.staff-member': SharedStaffMember;
    }
  }
}
