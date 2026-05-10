import mongoose from 'mongoose';

describe('Database connection', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not found in environment');
    }
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('can perform a basic database operation', async () => {
    const TestSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('Test', TestSchema);
    
    const entry = new TestModel({ name: 'Testing infrastructure' });
    await entry.save();
    
    const found = await TestModel.findOne({ name: 'Testing infrastructure' });
    expect(found).toBeDefined();
    expect(found?.name).toBe('Testing infrastructure');
  });
});
