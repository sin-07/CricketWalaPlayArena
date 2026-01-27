import mongoose from 'mongoose';

export interface IPaymentSettings {
  _id?: string;
  paymentsEnabled: boolean;
  disabledReason?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSettingsSchema = new mongoose.Schema<IPaymentSettings>(
  {
    paymentsEnabled: {
      type: Boolean,
      default: true,
      required: true,
    },
    disabledReason: {
      type: String,
      default: '',
    },
    lastUpdatedBy: {
      type: String,
      default: '',
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one document exists (singleton pattern)
PaymentSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      paymentsEnabled: true,
      disabledReason: '',
      lastUpdatedAt: new Date(),
    });
  }
  return settings;
};

PaymentSettingsSchema.statics.updateSettings = async function (
  paymentsEnabled: boolean,
  disabledReason: string = '',
  updatedBy: string = ''
) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      paymentsEnabled,
      disabledReason,
      lastUpdatedBy: updatedBy,
      lastUpdatedAt: new Date(),
    });
  } else {
    settings.paymentsEnabled = paymentsEnabled;
    settings.disabledReason = disabledReason;
    settings.lastUpdatedBy = updatedBy;
    settings.lastUpdatedAt = new Date();
    await settings.save();
  }
  return settings;
};

const PaymentSettings =
  mongoose.models.PaymentSettings ||
  mongoose.model<IPaymentSettings>('PaymentSettings', PaymentSettingsSchema);

export default PaymentSettings;
